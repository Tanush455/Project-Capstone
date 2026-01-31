import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";
import { prisma } from "../client/prismaClient"
import { otpEmailHtml } from "./emails/otp-template";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export const auth = betterAuth({
    baseURL: process.env.BACKEND_URL || "http://localhost:3005",
    basePath: "/api/auth",

    trustedOrigins: [
        process.env.FRONTEND_URL || "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],

    database: prismaAdapter(prisma, { provider: "postgresql" }),

    emailAndPassword: {
        enabled: true,
        // Important: keep this OFF if you want "login then verify" flow.
        // If true, signIn might be blocked until verified.
        // requireEmailVerification: true,
    },

    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },

    plugins: [
        emailOTP({
            // Use OTP instead of link when verification is triggered
            overrideDefaultEmailVerification: true,

            // Keep false because frontend will send OTP explicitly (prevents double emails)
            sendVerificationOnSignUp: false,

            otpLength: 6,
            expiresIn: 300,

            async sendVerificationOTP({ email, otp, type }) {
                console.log(`[emailOTP] Sending OTP to ${email}, type=${type}, otp=${otp}`);
                try {
                    const result = await resend.emails.send({
                        from: process.env.EMAIL_FROM!,
                        to: email,
                        subject: `Your verification code`,
                        html: otpEmailHtml({
                            appName: process.env.APP_NAME || "App",
                            otp,
                            type,
                        }),
                    });
                    console.log(`[emailOTP] Resend result:`, result);
                } catch (err) {
                    console.error(`[emailOTP] Error sending email:`, err);
                }
            },
        }),
    ],
});
