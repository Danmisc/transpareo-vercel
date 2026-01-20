import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export function generateTwoFactorSecret() {
    const secret = authenticator.generateSecret();
    return secret;
}

export async function generateTwoFactorQRCode(email: string, secret: string) {
    const otpauth = authenticator.keyuri(email, 'Banque P2P', secret);
    const imageUrl = await QRCode.toDataURL(otpauth);
    return imageUrl;
}

export function verifyTwoFactorToken(token: string, secret: string) {
    return authenticator.check(token, secret);
}
