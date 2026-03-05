import styles from "../login/page.module.css";
import ConfirmEmailForm from "./ConfirmEmailForm";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ConfirmEmailPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const resolvedParams = await searchParams;
    const token = resolvedParams.token;

    return (
        <div className={styles.authContainer} style={{ paddingTop: '100px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className={styles.backgroundGlow}></div>
            <div className={styles.authCard} style={{ maxWidth: '500px', width: '100%', position: 'relative', zIndex: 10 }}>

                <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Confirm Email Change</h2>

                {!token ? (
                    <div style={{ textAlign: 'center' }}>
                        <p className={styles.authSubtitle} style={{ marginBottom: '2rem', color: '#ef4444' }}>
                            Missing token. Please use the link provided in your email.
                        </p>

                        <Link href="/login" className="btn btn-outline" style={{ display: 'inline-block' }}>
                            Return Home
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className={styles.authSubtitle} style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            Please enter your password to confirm and finalize your email address change.
                        </p>
                        <ConfirmEmailForm token={token} />
                    </>
                )}

            </div>
        </div>
    );
}
