import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin/auth-utils'
import { prisma } from '@/lib/prisma'
import { Role, KycStatus } from '@prisma/client'
import { createNotification } from '@/lib/notifications/create-notification'
import { notifyProductApproved, notifyProductRejected } from '@/lib/notifications/templates/message-templates'
import { outbox } from '@/lib/outbox'
import { handleApiError } from '@/lib/api-wrapper'
import { NotificationType } from '@/lib/notifications/types'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const adminUserId = authResult.admin?.id || null;

    // ============= PERMISSION HELPERS =============
    const { hasPermission } = await import('@/lib/admin/permissions');

    // Helper to check permission
    const checkPermission = async (resource: string, actionType: string): Promise<boolean> => {
      if (!adminUserId) return true; // Legacy/Super admin considered fully auth'd if session established? 
      // Actually, standard admins (Role.ADMIN) are legacy. Sub-admins have ID in admin_session.
      // We should assume Role.ADMIN has full access unless constrained? 
      // For now, let's assume hasPermission handles it (it checks SuperAdmin role).
      // But we need to make sure adminUserId is valid.

      const allowed = await hasPermission(adminUserId, resource, actionType);
      console.log(`[Permission Check] User: ${adminUserId}, Resource: ${resource}, Action: ${actionType}, Allowed: ${allowed}`);
      return allowed;
    };

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const kycStatus = searchParams.get('kycStatus')

    if (type === 'products') {
      if (!(await checkPermission('products', 'view'))) return NextResponse.json([], { status: 403 });

      const products = await prisma.product.findMany({
        include: {
          vendor: {
            include: {
              user: true
            }
          },
          images: true,
          dressStyle: {
            select: {
              name: true,
              status: true
            }
          },
          _count: {
            select: { reviews: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(products)
    }

    if (type === 'users') {
      if (!(await checkPermission('users', 'view'))) return NextResponse.json([], { status: 403 });

      const canViewSellers = await checkPermission('sellers', 'view');

      const users = await prisma.user.findMany({
        include: {
          profile: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Map to frontend User type
      const formattedUsers = users.map(user => ({
        id: user.id || '', // Ensure ID is present
        name: user.name || user.profile?.firstName ? `${user.profile?.firstName} ${user.profile?.lastName}` : 'Unknown User',
        email: user.email,
        role: !canViewSellers && user.role === 'SELLER' ? 'USER' : user.role, // Hide SELLER role if no permission
        lastActive: new Date(user.createdAt).toLocaleDateString(), // Using createdAt as lastActive for now
        status: user.isActive ? 'Active' : 'Suspended',
        avatar: user.image || user.profile?.avatar || '/images/default-avatar.png'
      }));

      return NextResponse.json(formattedUsers)
    }

    if (type === 'vendors') {
      if (!(await checkPermission('sellers', 'view'))) return NextResponse.json([], { status: 403 });

      // 1. Fetch existing vendors
      const id = searchParams.get('id')
      const userIdParam = searchParams.get('userId')

      let vendors: any[] = []; // Explicitly allow mixed types

      if (id || userIdParam) {
        // Build where clause
        const where: any = {};
        if (id) where.id = id;
        if (userIdParam) where.userId = userIdParam;

        // Fetch specific vendor with full details
        vendors = await prisma.vendor.findMany({
          where,
          include: {
            products: {
              orderBy: { createdAt: 'desc' }
            },
            orders: {
              orderBy: { createdAt: 'desc' },
              include: {
                items: true,
                user: { select: { name: true, email: true } }
              }
            }, // Sales made by seller
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
                profile: true,
                userVerifications: {
                  orderBy: { createdAt: 'desc' },
                  include: { sellerAddress: true }
                },
                addresses: true,
                customerOrders: {
                  orderBy: { createdAt: 'desc' },
                  include: {
                    vendorOrders: {
                      include: {
                        items: true
                      }
                    }
                  }
                }
              }
            },
            _count: {
              select: { products: true, orders: true }
            }
          }
        })

        // Unification: If no vendor found, check for UserVerification (Applicant)
        if (vendors.length === 0) {
          const verification = await prisma.userVerification.findUnique({
            where: { id: id || undefined }, // Fix null type mismatch
            include: {
              user: {
                include: {
                  profile: true,
                  addresses: true,
                  userVerifications: {
                    orderBy: { createdAt: 'desc' },
                    include: { sellerAddress: true }
                  },
                  customerOrders: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                      vendorOrders: {
                        include: {
                          items: true
                        }
                      }
                    }
                  }
                }
              }
            }
          });

          if (verification) {
            vendors = [{
              id: verification.id,
              realId: verification.id,
              kycStatus: 'PENDING' as KycStatus,
              storeName: (verification.user as any).name + " (Applicant)",
              createdAt: verification.submittedAt || verification.createdAt,
              user: verification.user as any,
              userId: verification.userId,
              isActive: false,
              isApplicant: true,
              products: [],
              orders: [],
              _count: { products: 0, orders: 0 }
            }];
          }
        }
      } else {
        // Fetch list for table
        vendors = await prisma.vendor.findMany({
          where: kycStatus ? { kycStatus: kycStatus as KycStatus } : {},
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
                profile: true,
                userVerifications: {
                  orderBy: { createdAt: 'desc' },
                  include: { sellerAddress: true }
                }
              }
            },
            _count: {
              select: { products: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      }

      // 2. Fetch pending verifications who don't have a vendor record yet
      // This catches new applicants who haven't been "enabled" as vendors yet
      const pendingVerifications = await prisma.userVerification.findMany({
        where: {
          status: 'submitted',
          user: {
            vendor: null // Only those who don't have a vendor profile yet
          }
        },
        include: {
          user: {
            include: {
              profile: true,
              addresses: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' }
      })

      // 3. Map verifications to a vendor-like structure for the frontend
      const applicantVendors = pendingVerifications.map(v => ({
        id: `temp-${v.id}`, // Mark as temp/applicant
        userId: v.userId,
        kycStatus: 'PENDING' as KycStatus,
        isActive: false,
        createdAt: v.submittedAt || v.createdAt,
        user: {
          ...v.user,
          userVerifications: [v] // Attach the verification to the user object so it matches Vendor structure
        },
        isApplicant: true, // Helper flag for frontend
        _count: { products: 0 }
      }))

      const allVendors = [...vendors, ...applicantVendors];

      // DECRYPTION LOGIC - OPTIMIZED
      // Only decrypt the latest verification to avoid massive performance penalty
      const { decryptAsync } = await import('@/lib/encryption');

      const decryptedVendors = await Promise.all(allVendors.map(async (v) => {
        const verifications = v.user?.userVerifications || [];

        // Clone the user/verifications structure to avoid mutation
        const updatedUser = { ...v.user };
        const updatedVerifications = [...verifications];

        // Decrypt only the latest one (index 0 because of orderBy: desc)
        if (updatedVerifications.length > 0) {
          const latest = { ...updatedVerifications[0] };
          let changed = false;

          try {
            if (latest.govIdNumber && latest.govIdNumber.includes(':')) {
              latest.govIdNumber = await decryptAsync(latest.govIdNumber);
              changed = true;
            }
          } catch (e) { /* Ignore */ }

          try {
            if (latest.taxId && latest.taxId.includes(':')) {
              latest.taxId = await decryptAsync(latest.taxId);
              changed = true;
            }
          } catch (e) { /* Ignore */ }

          if (changed) {
            updatedVerifications[0] = latest;
          }
        }

        updatedUser.userVerifications = updatedVerifications;

        return {
          ...v,
          user: updatedUser
        };
      }));

      // Combine and return
      return NextResponse.json(decryptedVendors)
    }

    if (type === 'reports') {
      if (!(await checkPermission('reports', 'view'))) return NextResponse.json([], { status: 403 });

      const reports = await prisma.report.findMany({
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          reportedUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              vendor: {
                select: {
                  user: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(reports)
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })

  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const adminUserId = authResult.admin?.id || null;

    const body = await request.json()
    const { type, productId, vendorId, userId, action, kycStatus, reason } = body

    // ============= PERMISSION ENFORCEMENT =============
    // Import permission checker (only if we have an admin user ID)
    const { hasPermission, logAdminAction } = await import('@/lib/admin/permissions');

    // Helper to check permission and return 403 if denied
    const checkPermission = async (resource: string, actionType: string): Promise<boolean> => {
      if (!adminUserId) return true; // Legacy admin without new permission system
      const allowed = await hasPermission(adminUserId, resource, actionType);
      return allowed;
    };

    if (type === 'product' && productId && action) {
      // Check permission: products:block for approve/reject
      if (!(await checkPermission('products', 'block'))) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to block/unblock products' },
          { status: 403 }
        );
      }

      const product = await prisma.product.update({
        where: { id: productId },
        data: {
          isActive: action === 'approve' || action === 'activate' ? true : action === 'reject' || action === 'block' ? false : undefined,
          status: action === 'approve' || action === 'activate' ? 'ACTIVE' : action === 'reject' || action === 'block' ? 'BLOCKED' : undefined
        },
        include: {
          vendor: true,
          images: true
        }
      })

      // Log the action
      if (adminUserId) {
        await logAdminAction(adminUserId, `product.${action}`, { type: 'Product', id: productId });
      }

      // ➤ PUBLISH REAL-TIME EVENT
      await outbox.broadcast('admin-updates', {
        entity: 'product',
        action: action,
        id: productId,
        timestamp: Date.now()
      })

      // ➤ NOTIFY SELLER
      try {
        if (action === 'approve') {
          await notifyProductApproved(product.vendor.userId, {
            productId: product.id,
            productName: product.name
          });
        } else if (action === 'reject') {
          await notifyProductRejected(product.vendor.userId, {
            productId: product.id,
            productName: product.name,
            reason: reason // reason is passed in body
          });
        }
      } catch (err) {
        console.error('Failed to notify seller about product:', err);
      }

      return NextResponse.json({
        success: true,
        message: `Product ${action}d successfully`,
        product
      })
    }

    if (type === 'vendor' && vendorId && kycStatus) {
      // Check permission: sellers:suspend for status changes
      if (!(await checkPermission('sellers', 'suspend'))) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to change vendor status' },
          { status: 403 }
        );
      }

      const vendor = await prisma.vendor.update({
        where: { id: vendorId },
        data: { kycStatus },
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      })

      // Log the action
      if (adminUserId) {
        await logAdminAction(adminUserId, `vendor.${kycStatus.toLowerCase()}`, { type: 'Vendor', id: vendorId });
      }

      // ➤ PUBLISH REAL-TIME EVENT
      await outbox.broadcast('admin-updates', {
        entity: 'vendor',
        action: kycStatus.toLowerCase(),
        id: vendorId,
        timestamp: Date.now()
      })

      // ➤ NOTIFY VENDOR
      try {
        const statusMap: Record<string, NotificationType> = {
          APPROVED: 'KYC_APPROVED',
          REJECTED: 'KYC_REJECTED',
          PENDING: 'KYC_INFO_NEEDED', // fallback
        };
        const notifType = statusMap[kycStatus] || 'KYC_INFO_NEEDED';

        const titleMap: Record<string, string> = {
          APPROVED: 'KYC Application Approved',
          REJECTED: 'KYC Application Rejected',
          PENDING: 'KYC Status Update'
        };

        const messageMap: Record<string, string> = {
          APPROVED: 'Congratulations! Your seller account has been approved. You can now start listing products.',
          REJECTED: reason ? `Your application was rejected. Reason: ${reason}` : 'Your application was rejected. Please review your details.',
          PENDING: 'Your KYC status has been updated.'
        };

        await createNotification({
          type: notifType,
          title: titleMap[kycStatus] || 'KYC Update',
          message: messageMap[kycStatus] || 'Your seller status has changed.',
          userId: vendor.userId,
          actionUrl: '/seller/dashboard',
          data: { kycStatus, reason }
        });
      } catch (err) {
        console.error('Failed to notify vendor:', err);
      }

      return NextResponse.json({
        success: true,
        message: `Vendor KYC ${kycStatus.toLowerCase()}`,
        vendor
      })
    }

    if (type === 'user' && userId && action) {
      // action: 'suspend' | 'activate' | 'edit'
      if (action === 'edit' && body.data) {
        // Check permission: users:edit
        if (!(await checkPermission('users', 'edit'))) {
          return NextResponse.json(
            { error: 'Forbidden: You do not have permission to edit users' },
            { status: 403 }
          );
        }

        const { name, email, role, status } = body.data;

        // Handle name splitting if necessary, or just update directly if DB has name field
        // Prisma User model usually has name, email, role. Status mapping is needed.

        const isActive = status === 'Active';

        const user = await prisma.user.update({
          where: { id: userId },
          data: {
            name,
            email,
            role: role as Role,
            isActive
          }
        });

        return NextResponse.json({
          success: true,
          message: 'User updated successfully',
          user
        });
      }

      // Check permission: users:suspend for suspend/activate
      if (action === 'suspend' || action === 'activate') {
        if (!(await checkPermission('users', 'suspend'))) {
          return NextResponse.json(
            { error: 'Forbidden: You do not have permission to suspend/activate users' },
            { status: 403 }
          );
        }
      }

      const isActive = action === 'activate';

      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive }
      });

      // Log the action
      if (adminUserId) {
        await logAdminAction(adminUserId, `user.${action}`, { type: 'User', id: userId });
      }

      // ➤ PUBLISH REAL-TIME EVENT
      await outbox.broadcast('admin-updates', {
        entity: 'user',
        action: action,
        id: userId,
        timestamp: Date.now()
      })

      // ➤ NOTIFY USER
      try {
        const { notifyAccountSuspended, notifyAccountReactivated } = await import('@/lib/notifications/templates/auth-templates');

        if (isActive) {
          await notifyAccountReactivated(userId, user.name || undefined);
        } else {
          await notifyAccountSuspended(userId, user.name || undefined);
        }
      } catch (err) {
        console.error('Failed to send notification for user action:', err);
      }

      return NextResponse.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
        user
      });
    }

    if (type === 'report' && body.reportId && body.action) {
      // Check permission: reports:take_action or reports:dismiss
      const reportPermAction = body.action === 'takeAction' ? 'take_action' : 'dismiss';
      if (!(await checkPermission('reports', reportPermAction))) {
        return NextResponse.json(
          { error: `Forbidden: You do not have permission to ${body.action} reports` },
          { status: 403 }
        );
      }

      // action: 'takeAction' | 'dismiss'
      const status = body.action === 'takeAction' ? 'reviewed' : body.action === 'dismiss' ? 'resolved' : undefined;

      if (!status) {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      const report = await prisma.report.update({
        where: { id: body.reportId },
        data: { status },
        include: {
          reporter: true,
          reportedUser: true,
          product: true
        }
      });

      return NextResponse.json({
        success: true,
        message: `Report ${status} successfully`,
        report
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  } catch (error) {
    return handleApiError(error);
  }
}
