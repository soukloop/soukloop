import { createNotification, notifyAllAdmins } from '../create-notification'
import * as React from 'react'
import { SellerApprovedEmail } from '@/lib/email-templates/account/seller-approved'
import { SellerRejectedEmail } from '@/lib/email-templates/account/seller-rejected'

interface KycData {
    verificationId: string
    userName?: string
    reason?: string
}

/**
 * Notify seller that KYC application was approved
 * Sends both in-app and email notification
 */
export async function notifyKycApproved(userId: string, data: KycData) {
    const actionUrl = '/seller/dashboard'
    return createNotification({
        userId,
        type: 'KYC_APPROVED',
        title: 'Seller Application Approved! 🎉',
        message: 'Congratulations! Your seller application has been approved. You can now start listing products and reach customers worldwide.',
        data,
        actionUrl,
        sendEmail: true,
        emailSubject: 'Your Seller Application Has Been Approved! 🎉',
        emailReact: React.createElement(SellerApprovedEmail, {
            userName: data.userName,
            actionUrl: process.env.NEXTAUTH_URL ? process.env.NEXTAUTH_URL + actionUrl : undefined
        }) as React.ReactElement
    })
}

/**
 * Notify seller that KYC application was rejected
 * Sends both in-app and email notification
 */
export async function notifyKycRejected(userId: string, data: KycData) {
    const reasonText = data.reason
        ? `Reason: ${data.reason}`
        : 'Please contact support for more details.'
    const actionUrl = '/seller/status'

    return createNotification({
        userId,
        type: 'KYC_REJECTED',
        title: 'Seller Application Update',
        message: `Unfortunately, your seller application was not approved. ${reasonText}`,
        data,
        actionUrl,
        sendEmail: true,
        emailSubject: 'Update on Your Seller Application',
        emailReact: React.createElement(SellerRejectedEmail, {
            userName: data.userName,
            rejectionReason: data.reason,
            actionUrl: process.env.NEXTAUTH_URL ? process.env.NEXTAUTH_URL + actionUrl : undefined
        }) as React.ReactElement
    })
}

/**
 * Notify seller that more information is needed for KYC
 * Sends both in-app and email notification
 */
export async function notifyKycInfoNeeded(userId: string, data: KycData & { fieldsNeeded?: string[] }) {
    const fieldsText = data.fieldsNeeded?.length
        ? ` Please update: ${data.fieldsNeeded.join(', ')}.`
        : ''

    return createNotification({
        userId,
        type: 'KYC_INFO_NEEDED',
        title: 'Additional Information Required 📝',
        message: `We need more information to process your seller application.${fieldsText}`,
        data,
        actionUrl: '/seller/onboarding',
        sendEmail: true,
        emailSubject: 'Action Required: Complete Your Seller Application'
    })
}

/**
 * Notify user that their KYC application was submitted
 * Sends both in-app and email notification
 */
export async function notifyKycSubmitted(userId: string, data: KycData) {
    return createNotification({
        userId,
        type: 'KYC_SUBMITTED',
        title: 'Application Submitted! 📋',
        message: 'Your seller application has been submitted successfully. We will review it within 24-48 hours.',
        data,
        actionUrl: '/seller/status',
        sendEmail: true,
        emailSubject: 'Seller Application Received - We\'re Reviewing It!'
    })
}

/**
 * Notify all admins about a new KYC submission for review
 * Sends both in-app and email notification to ALL admins
 */
export async function notifyAdminsNewKycSubmission(data: KycData) {
    return notifyAllAdmins(
        'NEW_KYC_SUBMISSION',
        'New Seller Application 📋',
        `${data.userName || 'A user'} has submitted a seller application for review.`,
        data,
        `/admin/kyc/${data.verificationId}`
    )
}
