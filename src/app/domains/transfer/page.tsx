"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { useState } from "react";
import { transferDomain, getTransferPricing } from "../../actions/domains";
import { useI18n } from "../../I18nProvider";

export default function DomainTransfer() {
    const [domainName, setDomainName] = useState("");
    const [authCode, setAuthCode] = useState("");
    const [step, setStep] = useState(1);
    const [isTransferring, setIsTransferring] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const { t } = useI18n();

    const [transferPrice, setTransferPrice] = useState<number | null>(null);
    const [renewalPrice, setRenewalPrice] = useState<number | null>(null);

    const handleContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domainName.trim() || !authCode.trim()) return;

        setIsTransferring(true);
        setError(null);

        try {
            const pricing = await getTransferPricing(domainName.trim());
            if (pricing.error) {
                setError(pricing.error);
                setIsTransferring(false);
                return;
            }
            setTransferPrice(pricing.transferPrice);
            setRenewalPrice(pricing.renewalPrice);
            setStep(2);
        } catch (err) {
            setError(t('transfer', 'error'));
        } finally {
            setIsTransferring(false);
        }
    };

    const handleConfirm = async () => {
        setIsTransferring(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await transferDomain(domainName.trim(), authCode.trim());
            if (response.error) {
                setError(response.error);
                setStep(1); // Go back to form on error
            } else if (response.success) {
                setSuccess(true);
                setDomainName("");
                setAuthCode("");
                setStep(1);
            }
        } catch (err) {
            setError(t('transfer', 'error'));
            setStep(1);
        } finally {
            setIsTransferring(false);
        }
    };

    const nextPaymentDate = new Date();
    nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
    const formattedDate = nextPaymentDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className={styles.transferContainer}>
            <div className={styles.transferHeader}>
                <h2>{t('transfer', 'title')}</h2>
                <p className={styles.subtitle}>{t('transfer', 'subtitle')}</p>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            {success && (
                <div className={styles.successMessage}>
                    {t('transfer', 'success')}
                    <div style={{ marginTop: '1rem' }}>
                        <Link href="/domains" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
                            {t('nav', 'domains')}
                        </Link>
                    </div>
                </div>
            )}

            {!success && step === 1 && (
                <form onSubmit={handleContinue} className={styles.transferForm}>
                    <div className={styles.inputGroup}>
                        <label>{t('transfer', 'domainPlaceholder')}</label>
                        <input
                            type="text"
                            placeholder="example.com"
                            className={styles.transferInput}
                            value={domainName}
                            onChange={(e) => setDomainName(e.target.value)}
                            disabled={isTransferring}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>{t('transfer', 'authCodePlaceholder')}</label>
                        <input
                            type="text"
                            placeholder="EPP code"
                            className={styles.transferInput}
                            value={authCode}
                            onChange={(e) => setAuthCode(e.target.value)}
                            disabled={isTransferring}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.submitBtn}`}
                        disabled={isTransferring || !domainName.trim() || !authCode.trim()}
                        style={{ opacity: isTransferring ? 0.7 : 1 }}
                    >
                        {isTransferring ? t('transfer', 'btnTransferring') : t('transfer', 'btnContinue')}
                    </button>
                </form>
            )}

            {!success && step === 2 && (
                <div className={styles.summaryContainer}>
                    <div className={styles.summaryHeader}>
                        <h3>{t('transfer', 'summaryTitle')}</h3>
                        <p>{t('transfer', 'summarySubtitle')}</p>
                    </div>

                    <div className={styles.timelineContainer}>
                        <div className={styles.timelineItem}>
                            <div className={`${styles.timelineDot} ${styles.timelineDotActive}`}></div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineHeader}>
                                    <span className={styles.timelineTitle}>{t('transfer', 'dueNow')}</span>
                                    <span className={styles.timelinePrice}>
                                        {transferPrice !== null ? `$${transferPrice.toFixed(2)}` : 'N/A'}
                                    </span>
                                </div>
                                <div className={styles.timelineDesc}>
                                    <div>{domainName}</div>
                                    <small>{t('transfer', 'freeWhois')}</small>
                                </div>
                            </div>
                        </div>

                        <div className={styles.timelineItem}>
                            <div className={styles.timelineDot}></div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineHeader}>
                                    <span className={styles.timelineTitle}>{t('transfer', 'extendedBy1Year')}</span>
                                    <span className={styles.timelinePrice}>+$0.00</span>
                                </div>
                                <div className={styles.timelineDesc}>
                                    <small>{t('transfer', 'extendedBy1YearDesc')}</small>
                                </div>
                            </div>
                        </div>

                        <div className={styles.timelineItem}>
                            <div className={`${styles.timelineDot} ${styles.timelineDotFuture}`}></div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineHeader}>
                                    <span className={`${styles.timelineTitle} ${styles.futureText}`}>{t('transfer', 'nextPaymentDue')}</span>
                                    <span className={`${styles.timelinePrice} ${styles.futureText}`}>
                                        {renewalPrice !== null ? `$${renewalPrice.toFixed(2)}` : 'N/A'}
                                    </span>
                                </div>
                                <div className={styles.timelineDesc}>
                                    <small className={styles.futureText}>{t('transfer', 'uponRenewal')} ({formattedDate})</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.paymentPlaceholder}>
                        <div className={styles.paymentIcon}>💳</div>
                        <p>{t('transfer', 'paymentPlaceholder')}</p>
                    </div>

                    <div className={styles.summaryActions}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setStep(1)}
                            disabled={isTransferring}
                        >
                            {t('common', 'cancel')}
                        </button>
                        <button
                            type="button"
                            className={`btn btn-primary`}
                            onClick={handleConfirm}
                            disabled={isTransferring}
                            style={{ opacity: isTransferring ? 0.7 : 1 }}
                        >
                            {isTransferring ? t('transfer', 'btnTransferring') : t('transfer', 'btnConfirmPay')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
