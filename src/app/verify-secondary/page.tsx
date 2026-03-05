import Link from "next/link";
import PocketBase from 'pocketbase';
import styles from "../login/page.module.css";
import { cookies } from "next/headers";
import crypto from "crypto";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

const HMAC_SECRET = process.env.RESEND_API_TOKEN || 'fallback-secret-for-dev-only';

function decodeSecureToken(token: string): any {
    try {
        const parts = token.split('.');
        if (parts.length !== 2) return null;
        const [data, signature] = parts;
        const expectedSignature = crypto.createHmac('sha256', HMAC_SECRET).update(data).digest('base64url');

        const sigBuf = Buffer.from(signature, 'base64url');
        const expSigBuf = Buffer.from(expectedSignature, 'base64url');

        if (sigBuf.length !== expSigBuf.length) return null;
        if (crypto.timingSafeEqual(sigBuf, expSigBuf)) {
            return JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
        }
    } catch (e) {
        return null;
    }
    return null;
}

export default async function VerifySecondaryPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const resolvedParams = await searchParams;
    const token = resolvedParams.token;

    let success = false;
    let message = "We're attempting to verify your secondary email...";

    if (!token) {
        message = "No verification token provided. Please check your email link again.";
    } else {
        const cookieStore = await cookies();
        const pbAuth = cookieStore.get('pb_auth')?.value;

        if (!pbAuth) {
            const redirectParams = encodeURIComponent(`/verify-secondary?token=${token}`);
            redirect(`/login?redirectTo=${redirectParams}`);
        } else {
            const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/';
            const pb = new PocketBase(pbUrl);
            pb.authStore.save(pbAuth, null);

            try {
                await pb.collection('users').authRefresh();
                const user = pb.authStore.model;

                if (!user) throw new Error("Invalid user");

                const payload = decodeSecureToken(token);

                if (!payload) {
                    throw new Error("Invalid or tampered token signature.");
                }

                if (payload.id === user.id && payload.email === user.secondaryEmail) {
                    await pb.collection('users').update(user.id, {
                        secondaryEmailVerified: true
                    });
                    success = true;
                    message = "Your secondary email has been successfully verified! You may now return to settings.";
                } else {
                    success = false;
                    message = "Verification unsuccessful. The token may be invalid, or your secondary email has changed.";
                }
            } catch (err: any) {
                success = false;
                message = "Verification unsuccessful or session expired.";
            }
        }
    }

    return (
        <div className={styles.authContainer} style={{ paddingTop: '100px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className={styles.backgroundGlow}></div>
            <div className={styles.authCard} style={{ textAlign: 'center', maxWidth: '500px', width: '100%', position: 'relative', zIndex: 10 }}>

                {success ? (
                    <>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%',
                            background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>

                        <h2 style={{ marginBottom: '1rem', color: '#10b981' }}>Verification Successful</h2>
                        <p className={styles.authSubtitle} style={{ marginBottom: '2rem' }}>
                            {message}
                        </p>

                        <Link href="/settings/security" className="btn btn-primary" style={{ display: 'inline-block' }}>
                            Return to Settings
                        </Link>
                    </>
                ) : (
                    <>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>

                        <h2 style={{ marginBottom: '1rem', color: '#ef4444' }}>Verification Unsuccessful</h2>
                        <p className={styles.authSubtitle} style={{ marginBottom: '2rem' }}>
                            {message}
                        </p>

                        <Link href="/settings/security" className="btn btn-outline" style={{ display: 'inline-block' }}>
                            Return to Settings
                        </Link>
                    </>
                )}

            </div>
        </div>
    );
}
