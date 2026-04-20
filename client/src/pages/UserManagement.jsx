import { useEffect, useState } from 'react';
import { Mail, Plus, Shield, UserRound, X } from 'lucide-react';
import AlertBanner from '../components/inventory/AlertBanner';
import { createSystemUser, fetchSystemUsers } from '../services/inventoryApi';

export default function UserManagement({ user }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'sales_staff' });
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const isAdmin = user?.role === 'admin';

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await fetchSystemUsers();
            setUsers(data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleCreateUser = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setFieldErrors({});

        const nextErrors = {};
        const normalizedUsername = String(formData.username || '').trim();
        const normalizedPassword = String(formData.password || '');
        const normalizedRole = formData.role === 'admin' ? 'admin' : 'sales_staff';

        if (!normalizedUsername) {
            nextErrors.username = 'Username is required.';
        } else if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(normalizedUsername)) {
            nextErrors.username = 'Username must be 3 to 30 chars (letters, numbers, _, ., -).';
        }

        if (!normalizedPassword) {
            nextErrors.password = 'Password is required.';
        } else if (normalizedPassword.length < 8) {
            nextErrors.password = 'Password must be at least 8 characters.';
        }

        if (!['admin', 'sales_staff'].includes(normalizedRole)) {
            nextErrors.role = 'Please select a valid role.';
        }

        if (Object.keys(nextErrors).length > 0) {
            setFieldErrors(nextErrors);
            return;
        }

        setSubmitting(true);

        try {
            await createSystemUser({
                username: normalizedUsername,
                password: normalizedPassword,
                role: normalizedRole
            });
            setSuccess('User created successfully');
            setShowForm(false);
            setFormData({ username: '', password: '', role: 'sales_staff' });
            await loadUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                <h2 className="text-xl font-black text-slate-900">Access Restricted</h2>
                <p className="mt-2 text-sm text-slate-500">Only administrators can manage system users.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">User Access Management</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Create and review admin or sales staff accounts for ERP operations.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Create User
                </button>
            </div>

            <AlertBanner type="error" message={error} onClose={() => setError('')} />
            <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />

            {loading ? (
                <div className="flex h-48 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[10px] font-black tracking-widest uppercase text-slate-500">User</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-black tracking-widest uppercase text-slate-500">Role</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-black tracking-widest uppercase text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-black tracking-widest uppercase text-slate-500">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {users.map((entry) => (
                                    <tr key={entry._id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-full bg-slate-100 p-2">
                                                    <Mail className="h-4 w-4 text-blue-700" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-900">{entry.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 capitalize">
                                                <Shield className="h-3.5 w-3.5 text-slate-500" />
                                                {entry.role === 'admin' ? 'Admin' : 'Sales Staff'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-700 font-semibold">
                                            Active
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                                            {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showForm ? (
                <div className="modal-overlay">
                    <div className="modal-card max-w-md">
                        <div className="modal-header">
                            <h3 className="modal-title">Create User</h3>
                            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="field-label">Username</label>
                                    <input
                                        required
                                        type="text"
                                        minLength={3}
                                        maxLength={30}
                                        className="field"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                    {fieldErrors.username ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.username}</p> : null}
                                </div>
                                <div>
                                    <label className="field-label">Password</label>
                                    <input
                                        required
                                        minLength={8}
                                        type="password"
                                        className="field"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    {fieldErrors.password ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.password}</p> : null}
                                </div>
                                <div>
                                    <label className="field-label">Role</label>
                                    <select
                                        className="field"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="sales_staff">Sales Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {fieldErrors.role ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.role}</p> : null}
                                </div>

                                <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800 flex items-center gap-2">
                                    <UserRound className="h-4 w-4" />
                                    New users can sign in using username and password on the same login screen.
                                </div>

                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-60">
                                        {submitting ? 'Creating...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
