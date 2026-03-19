/**
 * Email utility using Resend API to send verification codes.
 */
export async function sendVerificationEmail(to: string, code: string): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
        console.error("RESEND_API_KEY is not defined in environment.");
        return false;
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                from: 'Verification <onboarding@resend.dev>',
                to: [to],
                subject: '[정적검증 포탈] 비밀번호 재설정 인증번호',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
                        <h2 style="color: #2563eb; text-align: center;">비밀번호 재설정 인증번호</h2>
                        <p style="font-size: 16px; color: #333;">안녕하세요, 정적검증 업무 포탈입니다.</p>
                        <p style="font-size: 16px; color: #333;">비밀번호 재설정을 위한 6자리 인증번호를 안내해 드립니다:</p>
                        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111;">${code}</span>
                        </div>
                        <p style="font-size: 14px; color: #666;">본 인증번호는 <strong>10분간만 유효</strong>합니다.</p>
                        <p style="font-size: 14px; color: #999; margin-top: 30px; border-top: 1px solid #eee; pt-10px;">본 메일은 시스템에 의해 자동으로 발송되었습니다. 본인이 요청하지 않은 경우 무시하시기 바랍니다.</p>
                    </div>
                `,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Resend API error:", error);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Failed to send email:", err);
        return false;
    }
}
