"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { useActionState, useState } from "react";
import { searchDomain, DomainSearchResult } from "../../actions/domains";
import { useI18n } from "../../I18nProvider";

export default function DomainSearch() {
    const [keyword, setKeyword] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<DomainSearchResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { t, formatCurrency } = useI18n();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setIsSearching(true);
        setError(null);
        setResults([]);

        try {
            const response = await searchDomain(keyword.trim());
            if (response.error) {
                setError(response.error);
            } else if (response.results) {
                setResults(response.results);
            }
        } catch (err) {
            setError("An unexpected error occurred while searching.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className={styles.searchContainer}>
            <div className={styles.searchHeader}>
                <h2>{t('search', 'title')}</h2>
                <p className={styles.subtitle}>{t('search', 'subtitle')}</p>

                <form onSubmit={handleSearch} className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder={t('search', 'placeholder')}
                        className={styles.searchInput}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        disabled={isSearching}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSearching || !keyword.trim()}
                        style={{ opacity: isSearching ? 0.7 : 1 }}
                    >
                        {isSearching ? t('search', 'btnSearching') : t('search', 'btnSearch')}
                    </button>
                </form>
            </div>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {error}
                </div>
            )}

            <div className={styles.resultsContainer}>
                {results.map((result, idx) => (
                    <div key={idx} className={styles.resultItem}>
                        <div className={styles.domainDetails}>
                            <h3 style={{ color: result.purchasable ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                {result.domainName}
                            </h3>
                            {result.purchasable ? (
                                <span className={styles.statusAvailable}>{t('search', 'available')}</span>
                            ) : (
                                <span className={styles.statusTaken}>{t('search', 'taken')}</span>
                            )}
                        </div>

                        <div className={styles.priceActions}>
                            {result.purchasable ? (
                                <>
                                    <span className={styles.price}>{formatCurrency(result.purchasePrice || 0)}/yr</span>
                                    <button className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>{t('search', 'add')}</button>
                                </>
                            ) : (
                                <button className="btn btn-outline" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem', opacity: 0.5, cursor: 'not-allowed' }} disabled>
                                    {t('search', 'unavailable')}
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {!isSearching && results.length === 0 && !error && (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', opacity: 0.5 }}>
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <p>{t('search', 'emptyText')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
