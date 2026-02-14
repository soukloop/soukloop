import { createNotification } from '../create-notification'
import { prisma } from '@/lib/prisma'

interface ProductData {
  productId: string
  productName: string
  productSlug?: string
  price?: number
  imageUrl?: string
  [key: string]: any
}

/**
 * Helper to generate HTML email with Product Card
 */
function generateProductEmailHtml(title: string, message: string, data: ProductData, actionUrl: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const fullActionUrl = `${baseUrl}${actionUrl}`

  // Format Price
  const formattedPrice = data.price
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.price)
    : 'Price not set'

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #E87A3F 0%, #C96835 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; background: #E87A3F; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
        .product-card { border: 1px solid #eee; border-radius: 12px; overflow: hidden; margin: 25px 0; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .product-img { width: 100%; height: 250px; object-fit: cover; background: #f9f9f9; }
        .product-details { padding: 20px; text-align: left; }
        .product-title { margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #111; }
        .product-price { margin: 0; color: #E87A3F; font-size: 18px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${baseUrl}/soukloop-logo.png" alt="SoukLoop" width="150" style="display:block;margin:0 auto;" />
        </div>
        <div class="content">
          <h2 style="margin-top:0;">${title}</h2>
          <p>${message}</p>
          
          <div class="product-card">
             ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.productName}" class="product-img" />` : ''}
             <div class="product-details">
                <h3 class="product-title">${data.productName}</h3>
                <p class="product-price">${formattedPrice}</p>
             </div>
          </div>

          <div style="text-align: center;">
            <a href="${fullActionUrl}" class="button">View Product</a>
          </div>
        </div>
        <div class="footer">
          <p>This email was sent by SoukLoop.</p>
        </div>
      </div>
    </body>
    </html>
    `
}

/**
 * Notify seller that their product was successfully listed (LIVE)
 */
export async function notifySellerProductListed(sellerId: string, data: ProductData) {
  const actionUrl = `/product/${data.productSlug || data.productId}`
  const title = 'Product Listed Successfully! 📦'
  const message = `Your product is now live on SoukLoop.`

  return createNotification({
    userId: sellerId,
    type: 'PRODUCT_LISTED',
    title,
    message: `Your product "${data.productName}" is now live.`,
    data,
    actionUrl,
    sendEmail: true,
    emailSubject: `Product Listed - ${data.productName}`,
    emailHtml: generateProductEmailHtml(title, message, data, actionUrl)
  })
}

/**
 * Notify seller that their product is pending due to Dress Style approval
 */
export async function notifySellerProductPending(sellerId: string, data: ProductData, styleName?: string) {
  const actionUrl = `/product/${data.productSlug || data.productId}`
  const title = 'Product Listed (Pending Approval) ⏳'
  const message = `Your product "${data.productName}" has been listed, but it will only be visible to the public once the requested dress style "${styleName || 'New Style'}" is approved by our team.`

  return createNotification({
    userId: sellerId,
    type: 'PRODUCT_LISTED', // Or Create a new type if needed, but existing works for now
    title,
    message: `Product listed privately. Waiting for style "${styleName}" approval.`,
    data,
    actionUrl,
    sendEmail: true,
    emailSubject: `Product Pending - ${data.productName}`,
    emailHtml: generateProductEmailHtml(title, message, data, actionUrl)
  })
}

/**
 * Notify seller that their requested Dress Style is approved
 */
export async function notifySellerStyleApproved(sellerId: string, styleName: string) {
  const title = 'Dress Style Approved! ✅'
  const message = `Good news! The dress style "${styleName}" you requested has been approved. Any pending products using this style are now live.`

  return createNotification({
    userId: sellerId,
    type: 'SYSTEM_ANNOUNCEMENT', // Using system announcement for this
    title,
    message,
    data: { styleName },
    actionUrl: '/seller/dashboard',
    sendEmail: true,
    emailSubject: `Style Approved - ${styleName}`
    // No product card here, defaulting to standard email
  })
}

/**
 * Notify all followers of a seller about a new product listing
 */
export async function notifyFollowersNewProduct(sellerId: string, data: ProductData) {
  // Get the seller's name
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: { name: true }
  })

  const sellerName = seller?.name || 'A seller you follow'

  // Get all follower user IDs
  const followers = await prisma.follow.findMany({
    where: { followingId: sellerId },
    select: { followerId: true }
  })

  if (followers.length === 0) return []

  const formattedPrice = data.price
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.price)
    : ''

  const actionUrl = `/product/${data.productSlug || data.productId}`
  const title = `${sellerName} listed a new product! 🛍️`
  const message = `"${data.productName}" is now available.`

  // Generate HTML once
  const emailHtml = generateProductEmailHtml(title, message, data, actionUrl);

  const results = await Promise.allSettled(
    followers.map(f =>
      createNotification({
        userId: f.followerId,
        type: 'NEW_PRODUCT_FROM_FOLLOWED',
        title,
        message: `"${data.productName}" is now available.`,
        data: { ...data, sellerName },
        actionUrl,
        sendEmail: true,
        emailSubject: `New from ${sellerName}: ${data.productName}`,
        emailHtml: emailHtml // Use the visual card
      })
    )
  )

  return results
}

/**
 * Notify reporter that their product report has been received
 */
export async function notifyReportReceived(userId: string, data: { productName: string, reason: string }) {
  const title = 'Report Received 🛡️'
  const message = `Thank you for reporting "${data.productName}". We take these reports seriously and will review it shortly. The seller has not been notified.`

  return createNotification({
    userId,
    type: 'SYSTEM_ANNOUNCEMENT',
    title,
    message,
    data,
    actionUrl: '/', // Redirect to home or keep generic
    sendEmail: true, // Use standard email for now
    emailSubject: `Report Received - ${data.productName}`
  })
}
