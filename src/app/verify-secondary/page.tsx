import Link from "next/link";
import PocketBase from 'pocketbase';
import styles from "../login/page.module.css";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

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
            message = "You must be logged in to verify this email.";
        } else {
            const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/';
            const pb = new PocketBase(pbUrl);
            pb.authStore.save(pbAuth, null);

            try {
                await pb.collection('users').authRefresh();
                const user = pb.authStore.model;

                if (!user) throw new Error("Invalid user");

                const payload = JSON.parse(atob(token));

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
