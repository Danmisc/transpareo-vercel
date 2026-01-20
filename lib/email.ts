import { Resend } from 'resend';

// NOTE: In a real production app, this key would be in .env
// For this demo, we can either use a placeholder or handle the absence gracefully.
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

// Premium email template styles
const emailStyles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background: #000000; padding: 32px; text-align: center; }
    .logo { color: #ffffff; font-size: 24px; font-weight: bold; text-decoration: none; letter-spacing: -0.5px; }
    .content { padding: 40px 32px; text-align: center; color: #18181b; }
    .h1 { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #000000; }
    .text { font-size: 16px; line-height: 1.6; color: #52525b; margin-bottom: 32px; }
    .button { display: inline-block; background-color: #000000; color: #ffffff !important; font-weight: 600; padding: 16px 32px; border-radius: 99px; text-decoration: none; font-size: 16px; transition: opacity 0.2s; }
    .button:hover { opacity: 0.9; }
    .code-box { background: #f4f4f5; border: 2px dashed #d4d4d8; padding: 20px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #18181b; margin: 24px 0; }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: #a1a1aa; background-color: #fafafa; border-top: 1px solid #f4f4f5; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; text-align: left; font-size: 14px; color: #92400e; margin: 24px 0; border-radius: 0 8px 8px 0; }
`;

async function sendEmail(to: string, subject: string, html: string) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[DEV MODE] Email to ${to}:`, subject);
        return { success: true, devMode: true };
    }

    try {
        let fromAddress = EMAIL_FROM;
        if (!fromAddress.includes('@')) {
            console.warn(`[Email Warning] Invalid EMAIL_FROM format. Falling back.`);
            fromAddress = 'onboarding@resend.dev';
        }

        const data = await resend.emails.send({
            from: fromAddress,
            to,
            subject,
            html
        });

        if (data.error) {
            console.error("Resend API Error:", data.error);
            return { success: false, error: data.error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Resend Exception:", error);
        return { success: false, error: error.message || "Erreur d'envoi" };
    }
}

/**
 * Send email verification for P2P/Banking (existing)
 */
export async function sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${APP_URL}/verify?token=${token}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${emailStyles}</style></head>
    <body>
        <div class="container">
            <div class="header"><div class="logo">Transpareo</div></div>
            <div class="content">
                <h1 class="h1">Confirmez votre identité</h1>
                <p class="text">
                    Bienvenue chez Transpareo. Pour sécuriser votre compte et accéder à nos services financiers, veuillez confirmer votre adresse email.
                </p>
                <a href="${verificationUrl}" class="button">Vérifier mon email</a>
                <p class="text" style="margin-top: 32px; font-size: 14px;">
                    Si vous n'avez pas demandé cette vérification, ignorez cet email.
                </p>
            </div>
            <div class="footer">
                &copy; 2026 Transpareo Financial Services.<br>Paris, France.
            </div>
        </div>
    </body>
    </html>
    `;

    const result = await sendEmail(email, 'Action requise : Vérifiez votre email', html);
    if (!process.env.RESEND_API_KEY) {
        console.log(`[DEV MODE] Verification URL: ${verificationUrl}`);
    }
    return result;
}

/**
 * Send email verification for AUTH registration
 */
export async function sendAuthVerificationEmail(email: string, token: string, name?: string) {
    const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${emailStyles}</style></head>
    <body>
        <div class="container">
            <div class="header"><div class="logo">Transpareo</div></div>
            <div class="content">
                <h1 class="h1">Bienvenue${name ? `, ${name}` : ''} !</h1>
                <p class="text">
                    Merci de rejoindre Transpareo. Pour activer votre compte et accéder à toutes les fonctionnalités, veuillez confirmer votre adresse email.
                </p>
                <a href="${verificationUrl}" class="button">Confirmer mon email</a>
                <div class="warning">
                    ⏰ Ce lien expire dans <strong>24 heures</strong>. Si vous n'avez pas créé ce compte, ignorez cet email.
                </div>
            </div>
            <div class="footer">
                &copy; 2026 Transpareo. Toulouse, France.
            </div>
        </div>
    </body>
    </html>
    `;

    const result = await sendEmail(email, 'Confirmez votre email - Transpareo', html);
    if (!process.env.RESEND_API_KEY) {
        console.log(`[DEV MODE] Auth Verification URL: ${verificationUrl}`);
    }
    return result;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${emailStyles}</style></head>
    <body>
        <div class="container">
            <div class="header"><div class="logo">Transpareo</div></div>
            <div class="content">
                <h1 class="h1">Réinitialisation du mot de passe</h1>
                <p class="text">
                    Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en créer un nouveau.
                </p>
                <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
                <div class="warning">
                    ⚠️ Ce lien expire dans <strong>1 heure</strong> et ne peut être utilisé qu'une seule fois.<br><br>
                    Si vous n'avez pas demandé cette réinitialisation, <strong>sécurisez immédiatement votre compte</strong>.
                </div>
            </div>
            <div class="footer">
                &copy; 2026 Transpareo. Toulouse, France.
            </div>
        </div>
    </body>
    </html>
    `;

    const result = await sendEmail(email, 'Réinitialisation de votre mot de passe - Transpareo', html);
    if (!process.env.RESEND_API_KEY) {
        console.log(`[DEV MODE] Password Reset URL: ${resetUrl}`);
    }
    return result;
}

/**
 * Send password changed confirmation
 */
export async function sendPasswordChangedEmail(email: string) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${emailStyles}</style></head>
    <body>
        <div class="container">
            <div class="header"><div class="logo">Transpareo</div></div>
            <div class="content">
                <h1 class="h1">Mot de passe modifié</h1>
                <p class="text">
                    Votre mot de passe a été modifié avec succès. Si vous n'êtes pas à l'origine de cette modification, contactez-nous immédiatement.
                </p>
                <div class="warning">
                    🔒 Toutes vos sessions actives ont été déconnectées par sécurité.
                </div>
                <a href="${APP_URL}/login" class="button">Se reconnecter</a>
            </div>
            <div class="footer">
                &copy; 2026 Transpareo. Toulouse, France.
            </div>
        </div>
    </body>
    </html>
    `;

    return await sendEmail(email, 'Votre mot de passe a été modifié - Transpareo', html);
}

