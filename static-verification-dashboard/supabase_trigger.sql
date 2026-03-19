-- 1. Enable HTTP extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- 2. Create function to send email via Resend
CREATE OR REPLACE FUNCTION public.send_verification_email_v2()
RETURNS TRIGGER AS $$
DECLARE
  target_email TEXT;
  resend_api_key TEXT := 're_U5iinuid_GwXPZDCJdFLWsA5cQXyaKimN';
BEGIN
  -- Get user email from users table
  SELECT email INTO target_email 
  FROM public.users 
  WHERE id = NEW.user_id;

  IF target_email IS NOT NULL THEN
    -- Perform HTTP POST to Resend API
    PERFORM extensions.http_post(
      'https://api.resend.com/emails',
      json_build_object(
        'from', 'Verification <onboarding@resend.dev>',
        'to', ARRAY[target_email],
        'subject', '[정적검증 포탈] 비밀번호 재설정 인증번호',
        'html', format(
          '<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">' ||
          '<h2 style="color: #2563eb; text-align: center;">비밀번호 재설정 인증번호</h2>' ||
          '<p style="font-size: 16px; color: #333;">안녕하세요, 정적검증 업무 포탈입니다.</p>' ||
          '<p style="font-size: 16px; color: #333;">비밀번호 재설정을 위한 6자리 인증번호를 안내해 드립니다:</p>' ||
          '<div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">' ||
          '<span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111;">%s</span>' ||
          '</div>' ||
          '<p style="font-size: 14px; color: #666;">본 인증번호는 <strong>10분간만 유효</strong>합니다.</p>' ||
          '<p style="font-size: 14px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">본 메일은 시스템에 의해 자동으로 발송되었습니다. 본인이 요청하지 않은 경우 무시하시기 바랍니다.</p>' ||
          '</div>',
          NEW.code
        )
      )::text,
      'application/json',
      'Bearer ' || resend_api_key
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS tr_send_verif_email ON public.verification_codes;

CREATE TRIGGER tr_send_verif_email
AFTER INSERT ON public.verification_codes
FOR EACH ROW
EXECUTE FUNCTION public.send_verification_email_v2();
