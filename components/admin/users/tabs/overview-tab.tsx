import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { CopyButton } from "@/components/ui/copy-button";
import { SensitiveDataDisplay } from "@/components/admin/users/ui/sensitive-data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, User, ShieldCheck, ImageIcon, Wallet, Receipt, CreditCard, Building2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
// revealSensitiveData removed - sensitive field decryption is now done lazily inside EditVendorForm
import { revealSensitiveData } from "../actions";
import { EditUserModal } from "../modals/edit-user-modal";
import { Package } from "lucide-react";
import { SellerApprovalActions } from "@/components/admin/users/ui/seller-approval-actions";

export default async function OverviewTab({ userId }: { userId: string }) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            profile: true,
            addresses: true,
            vendor: {
                include: {
                    _count: {
                        select: { orders: true, products: true }
                    }
                }
            },
            userVerifications: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
    });

    if (!user) return null;

    const verification = user.userVerifications[0];
    const isVendor = !!user.vendor;
    const showSellerInfo = isVendor || !!verification;
    const vendorKycStatus = user.vendor?.kycStatus || verification?.status;
    const isApproved = vendorKycStatus === 'APPROVED' || vendorKycStatus === 'approved';

    // taxId and govIdNumber are now lazily decrypted inside EditVendorForm via getDecryptedVendorData()

    return (
        <div className="space-y-6">

            {/* SECTION 1: PROFILE OVERVIEW */}
            <Card>
                <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        General Information
                    </CardTitle>
                    <EditUserModal
                        userId={userId}
                        mode="general"
                    />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
                        <DetailItem label="Full Name" value={user.name} />

                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</span>
                            <div className="group/email flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">{user.email}</span>
                                <CopyButton value={user.email} hoverOnly className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </div>

                        <DetailItem label="Phone Number" value={user.profile?.phone} />

                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User ID</span>
                            <div className="flex items-center gap-2">
                                <SensitiveDataDisplay value={user.id} className="font-mono text-xs" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Role</span>
                            <div className="flex gap-2">
                                {isVendor ? (
                                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100/80">Seller</Badge>
                                ) : (
                                    <Badge variant="outline">{user.role}</Badge>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                            <div className="flex items-center gap-2">
                                <span className={cn("h-2 w-2 rounded-full", user.isActive ? "bg-green-500" : "bg-red-500")} />
                                <span className="text-sm font-medium">{user.isActive ? "Active" : "Suspended"}</span>
                            </div>
                        </div>

                        <div className="md:col-span-2 lg:col-span-3">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Bio</span>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                                {user.profile?.bio || "No bio available."}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SECTION 2: SELLER INFORMATION (Conditional) */}
            {showSellerInfo && (
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="pb-4 border-b border-slate-100 bg-white">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900">
                                <ShieldCheck className="h-4 w-4 text-orange-600" />
                                Vendor Verification & Identity
                            </CardTitle>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className={cn("bg-white/80", isApproved ? "text-green-700 border-green-200" : (vendorKycStatus === 'rejected' ? "text-red-700 border-red-200" : "text-orange-700 border-orange-200"))}>
                                    {isApproved ? 'Verified Seller' : (vendorKycStatus?.toUpperCase() || 'UNKNOWN')}
                                </Badge>
                                {!isApproved && verification && verification.status === 'submitted' && (
                                    <SellerApprovalActions verificationId={user.vendor?.id || verification.id} />
                                )}
                                <EditUserModal
                                    userId={userId}
                                    mode="vendor"
                                    vendorInitialData={{
                                        slug: user.vendor?.slug || "",
                                        taxIdType: verification?.taxIdType || "",
                                        // taxId and govIdNumber are NOT passed here — EditVendorForm
                                        // fetches them asynchronously via getDecryptedVendorData()
                                        govIdType: verification?.govIdType || "",
                                        govIdFrontUrl: verification?.govIdFrontUrl || "",
                                        govIdBackUrl: verification?.govIdBackUrl || "",
                                        selfieUrl: verification?.selfieUrl || "",
                                        businessLicenseUrl: verification?.businessLicenseUrl || "",
                                        addressProofUrl: verification?.addressProofUrl || ""
                                    }}
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-8 pt-6">

                        {/* Stats Row - Styled */}
                        {user.vendor && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 shadow-[0_2px_8px_-2px_rgba(234,88,12,0.05)]">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                        <Wallet className="h-3.5 w-3.5 text-orange-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700/70">Wallet</span>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900 tracking-tight">${Number(user.vendor.walletBalance).toFixed(2)}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                        <Receipt className="h-3.5 w-3.5 text-slate-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Orders</span>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900 tracking-tight">{user.vendor._count.orders}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                        <Package className="h-3.5 w-3.5 text-slate-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Products</span>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900 tracking-tight">{user.vendor._count.products}</div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Business Identity */}
                            {user.vendor && (
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-orange-900/60 flex items-center gap-2">
                                        <Building2 className="h-3 w-3" />
                                        Business Identity
                                    </h4>
                                    <div className="bg-white rounded-xl border border-orange-100 p-5 space-y-4 shadow-sm">
                                        <DetailItem label="Vendor Slug" value={user.vendor.slug} copyable />
                                        <Separator className="bg-orange-50" />
                                        <DetailItem label="Vendor ID" value={user.vendor.id} isSensitive />
                                    </div>
                                </div>
                            )}

                            {/* Legal Identity */}
                            <div className={cn("space-y-4", !user.vendor ? "lg:col-span-2" : "")}>
                                <h4 className="text-[11px] font-bold uppercase tracking-widest text-orange-900/60 flex items-center gap-2">
                                    <ShieldCheck className="h-3 w-3" />
                                    Legal Identity
                                </h4>
                                <div className="bg-white rounded-xl border border-orange-100 p-5 space-y-4 shadow-sm">
                                    {verification && (
                                        <>
                                            <div className="space-y-1">
                                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tax ID ({verification.taxIdType || "N/A"})</span>
                                                <SensitiveDataDisplay
                                                    value={verification.taxId || ""}
                                                    className="font-mono text-sm"
                                                    onReveal={async () => {
                                                        "use server";
                                                        return await revealSensitiveData(verification.taxId!);
                                                    }}
                                                />
                                            </div>
                                            <Separator className="bg-orange-50" />
                                            <div className="space-y-1">
                                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    Gov ID ({verification.govIdType?.replace('_', ' ') || "N/A"})
                                                </span>
                                                {/* Provided ID Number with Masking */}
                                                <SensitiveDataDisplay
                                                    value={verification.govIdNumber || ""}
                                                    className="font-mono text-sm"
                                                    onReveal={async () => {
                                                        "use server";
                                                        // Fallback for encrypted data revealing, matching the TaxID pattern
                                                        return await revealSensitiveData(verification.govIdNumber!);
                                                    }}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Identity Documents Grid */}
                        <div>
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-orange-900/60 flex items-center gap-2 mb-4">
                                <ImageIcon className="h-3 w-3" />
                                Verification Documents
                            </h4>
                            {verification ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    <DocumentCard label="Gov ID Front" url={verification.govIdFrontUrl} />
                                    <DocumentCard label="Gov ID Back" url={verification.govIdBackUrl} />
                                    <DocumentCard label="Selfie" url={verification.selfieUrl} />
                                    {verification.businessLicenseUrl && (
                                        <DocumentCard label="Business License" url={verification.businessLicenseUrl} />
                                    )}
                                    {verification.addressProofUrl && (
                                        <DocumentCard label="Address Proof" url={verification.addressProofUrl} />
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 text-center border-2 border-dashed border-orange-100 bg-orange-50/20 rounded-xl text-orange-800/60 text-sm">
                                    No verification documents submitted.
                                </div>
                            )}
                        </div>

                    </CardContent>
                </Card>
            )}

            {/* SECTION 3: ADDRESSES */}
            <Card>
                <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Addresses
                    </CardTitle>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-muted-foreground">{user.addresses.length} Saved</Badge>
                        <EditUserModal
                            userId={userId}
                            mode="address"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {user.addresses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {user.addresses.map((addr) => (
                                <div key={addr.id} className="p-4 rounded-lg bg-orange-50/40 border border-orange-100/60 hover:border-orange-200 transition-colors space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="p-2 bg-white rounded-full border border-orange-100 shadow-sm">
                                            <MapPin className="h-4 w-4 text-orange-500" />
                                        </div>
                                        <div className="flex gap-1.5">
                                            {addr.isSellerAddress && <Badge variant="secondary" className="px-1.5 h-5 text-[10px] bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">Seller</Badge>}
                                            {addr.isDefault && <Badge className="px-1.5 h-5 text-[10px] bg-green-600 hover:bg-green-700">Default</Badge>}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="font-semibold text-sm text-foreground">{addr.address1}</div>
                                        {addr.address2 && <div className="text-sm text-muted-foreground">{addr.address2}</div>}
                                    </div>

                                    <div className="text-xs text-muted-foreground pt-2 border-t border-orange-100/60 mt-2">
                                        {addr.city}, {addr.state} {addr.postalCode}
                                        <div className="font-medium text-orange-800/70 mt-0.5 uppercase">{addr.country}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                            <MapPin className="h-8 w-8 mx-auto mb-3 opacity-20" />
                            No addresses found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Sub-components

function DetailItem({ label, value, copyable, isSensitive }: { label: string, value?: string | number | null, copyable?: boolean, isSensitive?: boolean }) {
    return (
        <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            <div className="group/detail flex items-center gap-2 text-sm font-medium text-foreground">
                {isSensitive ? (
                    <SensitiveDataDisplay value={String(value)} className="font-mono" />
                ) : (
                    <span>{value || <span className="text-muted-foreground italic">N/A</span>}</span>
                )}
                {copyable && value && <CopyButton value={String(value)} hoverOnly className="h-3 w-3 text-muted-foreground" />}
            </div>
        </div>
    );
}

function DocumentCard({ label, url }: { label: string, url?: string | null }) {
    return (
        <div className="space-y-2 group">
            <div className="relative aspect-[4/3] bg-slate-100 rounded-lg border overflow-hidden transition-all hover:ring-2 hover:ring-slate-900/10">
                {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        <Image src={url} alt={label} fill className="object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </a>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 gap-2">
                        <AlertCircle className="h-6 w-6" />
                        <span className="text-[10px] font-medium uppercase">Missing</span>
                    </div>
                )}
            </div>
            <p className="text-xs font-medium text-center text-muted-foreground">{label}</p>
        </div>
    );
}
