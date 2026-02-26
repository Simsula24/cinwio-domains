import { getUsers } from '../../actions/admin';
import UsersList from './UsersList';

export default async function AdminUsersPage() {
    const { users, error } = await getUsers();

    return (
        <div>
            {error ? (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    {error}
                </div>
            ) : (
                <UsersList initialUsers={users || []} />
            )}
        </div>
    );
}
