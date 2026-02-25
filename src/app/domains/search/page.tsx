import Link from "next/link";
import styles from "./page.module.css";

export default function DomainSearch() {
    return (
        <div className={styles.searchContainer}>
            <div className={styles.searchHeader}>
                <h2>Find Your Perfect Domain</h2>
                <p className={styles.subtitle}>Instantly search availability across hundreds of extensions.</p>

                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Enter a domain name (e.g., myawesomeidea.com)"
                        className={styles.searchInput}
                    />
                    <button className="btn btn-primary">Search</button>
                </div>
            </div>

            <div className={styles.resultsContainer}>
                <div className={styles.resultItem}>
                    <div className={styles.domainDetails}>
                        <h3>myawesomeidea.com</h3>
                        <span className={styles.statusAvailable}>Available</span>
                    </div>
                    <div className={styles.priceActions}>
                        <span className={styles.price}>$9.99/yr</span>
                        <button className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>Add</button>
                    </div>
                </div>

                <div className={styles.resultItem}>
                    <div className={styles.domainDetails}>
                        <h3 style={{ color: 'var(--text-secondary)' }}>myawesomeidea.net</h3>
                        <span className={styles.statusTaken}>Taken</span>
                    </div>
                    <div className={styles.priceActions}>
                        <button className="btn btn-outline" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem', opacity: 0.5, cursor: 'not-allowed' }}>Unavailable</button>
                    </div>
                </div>

                <div className={styles.resultItem}>
                    <div className={styles.domainDetails}>
                        <h3>myawesomeidea.co</h3>
                        <span className={styles.statusAvailable}>Available</span>
                    </div>
                    <div className={styles.priceActions}>
                        <span className={styles.price}>$24.99/yr</span>
                        <button className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>Add</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
