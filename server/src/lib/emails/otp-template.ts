export type OtpEmailTemplateArgs = {
    appName: string;
    otp: string;
    type: "sign-in" | "email-verification" | "forget-password";
};

export function otpEmailHtml({ appName, otp, type }: OtpEmailTemplateArgs) {
    const purpose =
        type === "sign-in"
            ? "sign in"
            : type === "email-verification"
                ? "verify your email"
                : "reset your password";

    return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${appName} OTP</title>
  </head>
  <body style="margin:0;background:#f6f7fb;">
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:28px;">
      <div style="background:#ffffff;border-radius:14px;padding:24px;border:1px solid #eceef5;">
        <h2 style="margin:0 0 10px;color:#111;">${appName} verification code</h2>
        <p style="margin:0 0 18px;color:#444;line-height:1.5;">
          Use this 6-digit code to ${purpose}.
        </p>

        <div style="font-size:30px;letter-spacing:10px;font-weight:800;background:#f3f4f6;padding:14px 18px;border-radius:12px;text-align:center;color:#111;">
          ${otp}
        </div>

        <p style="margin:18px 0 0;color:#6b7280;font-size:12px;line-height:1.5;">
          This code expires soon. If you didn’t request this, you can ignore this email.
        </p>
      </div>

      <p style="margin:14px 0 0;color:#9ca3af;font-size:12px;text-align:center;">
        © ${new Date().getFullYear()} ${appName}
      </p>
    </div>
  </body>
</html>`;
}
