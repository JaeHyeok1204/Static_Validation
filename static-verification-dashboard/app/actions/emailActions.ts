"use server";

import { sendVerificationEmail as sendEmailUtil } from '@/lib/email';

/**
 * Server action to send a verification email.
 * This ensures the RESEND_API_KEY is accessed on the server side.
 */
export async function sendVerificationEmailAction(to: string, code: string): Promise<boolean> {
    try {
        return await sendEmailUtil(to, code);
    } catch (error) {
        console.error("Error in sendVerificationEmailAction:", error);
        return false;
    }
}
