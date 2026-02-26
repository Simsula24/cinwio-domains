import { getDomains, getUsers } from '../../actions/admin';
import DomainsList from './DomainsList';

export default async function AdminDomainsPage() {
    const [{ domains, error: domainError }, { users, error: usersError }] = await Promise.all([
        getDomains(),
        getUsers()
    ]);

    const error = domainError || usersError;

    return (
        <div>
            {error ? (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    {error}
                </div>
            ) : (
                <DomainsList initialDomains={domains || []} users={users || []} />
            )}
        </div>
    );
}
