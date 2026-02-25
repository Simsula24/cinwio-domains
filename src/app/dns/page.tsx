import Link from "next/link";
import styles from "./page.module.css";

export default function DnsManagement() {
    return (
        <div className={styles.dnsContainer}>
            <div className={styles.dnsHeader}>
                <div>
                    <h2>DNS Management</h2>
                    <p className={styles.subtitle}>Powered by Cloudflare</p>
                </div>

                <div className={styles.selectorWrapper}>
                    <select className={styles.domainSelector}>
                        <option value="example.com">example.com</option>
                        <option value="my-awesome-startup.tech">my-awesome-startup.tech</option>
                    </select>
                </div>
            </div>

            <div className={styles.recordsSection}>
                <div className={styles.recordsHeader}>
                    <h3>DNS Records</h3>
                    <button className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>Add Record</button>
                </div>

                <div className={styles.recordsTableWrapper}>
                    <table className={styles.recordsTable}>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Name</th>
                                <th>Content</th>
                                <th>TTL</th>
                                <th>Proxy Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span className={styles.recordType}>A</span></td>
                                <td>example.com</td>
                                <td>192.0.2.1</td>
                                <td>Auto</td>
                                <td><span className={styles.proxyActive}>Proxied</span></td>
                                <td>
                                    <button className={styles.actionBtn}>Edit</button> | <button className={styles.actionBtnDel}>Delete</button>
                                </td>
                            </tr>
                            <tr>
                                <td><span className={styles.recordType}>CNAME</span></td>
                                <td>www</td>
                                <td>example.com</td>
                                <td>Auto</td>
                                <td><span className={styles.proxyActive}>Proxied</span></td>
                                <td>
                                    <button className={styles.actionBtn}>Edit</button> | <button className={styles.actionBtnDel}>Delete</button>
                                </td>
                            </tr>
                            <tr>
                                <td><span className={styles.recordType}>MX</span></td>
                                <td>@</td>
                                <td>mail.example.com</td>
                                <td>1 hour</td>
                                <td><span className={styles.proxyOff}>DNS Only</span></td>
                                <td>
                                    <button className={styles.actionBtn}>Edit</button> | <button className={styles.actionBtnDel}>Delete</button>
                                </td>
                            </tr>
                            <tr>
                                <td><span className={styles.recordType}>TXT</span></td>
                                <td>_dmarc</td>
                                <td>v=DMARC1; p=reject;</td>
                                <td>Auto</td>
                                <td><span className={styles.proxyOff}>DNS Only</span></td>
                                <td>
                                    <button className={styles.actionBtn}>Edit</button> | <button className={styles.actionBtnDel}>Delete</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
