import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, User, UserPlus, ShieldCheck } from 'lucide-react';
import { getAllUsers, deleteUser, inviteUser, updateMembership } from '../../services/adminService';

const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showInvite, setShowInvite] = useState(false);
    const [inviteForm, setInviteForm] = useState({
        email: '', firstName: '', lastName: '', role: 'user', membershipService: ''
    });
    const [inviteLoading, setInviteLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId, fullName) => {
        if (!window.confirm(`Supprimer ${fullName} ?`)) return;
        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleInvite = async () => {
        if (!inviteForm.email.trim()) return;
        try {
            setInviteLoading(true);
            // 1. Crée le user et envoie l'invitation
            const created = await inviteUser(inviteForm);

            // 2. Si membershipService renseigné, on récupère l'ID et on met à jour
            if (inviteForm.membershipService.trim()) {
                // On récupère la liste des users pour avoir l'ID du nouveau user
                const updatedUsers = await getAllUsers();
                const newUser = updatedUsers.find(u => u.email === inviteForm.email);
                if (newUser) {
                    await updateMembership(newUser.id, inviteForm.membershipService.trim());
                }
                setUsers(updatedUsers);
            } else {
                fetchUsers();
            }

            setShowInvite(false);
            setInviteForm({ email: '', firstName: '', lastName: '', role: 'user', membershipService: '' });
        } catch (err) {
            alert(err.message);
        } finally {
            setInviteLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.emailVerified === "true" &&
        (u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()))
    );

    const RoleBadge = ({ role }) => {
        const styles = {
            admin: 'bg-yellow-100 text-yellow-800',
            user:  'bg-blue-100 text-blue-800',
            none:  'bg-gray-100 text-gray-600',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role] || styles.none}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={24} className="text-[#003366]" />
                        <h1 className="text-2xl font-bold text-[#003366]">Admin — Users</h1>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Gérez les utilisateurs de la plateforme.</p>
                </div>
                <button
                    onClick={() => setShowInvite(!showInvite)}
                    className="flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-md hover:bg-[#002244] transition-colors"
                >
                    <UserPlus size={18} /> Inviter un utilisateur
                </button>
            </div>

            {/* Formulaire d'invitation */}
            {showInvite && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                    <h2 className="font-semibold text-[#003366] text-lg">Nouvel utilisateur</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                value={inviteForm.email}
                                onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                                placeholder="email@energie.sn"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                            <select
                                value={inviteForm.role}
                                onChange={e => setInviteForm({...inviteForm, role: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-sm"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                            <input
                                type="text"
                                value={inviteForm.firstName}
                                onChange={e => setInviteForm({...inviteForm, firstName: e.target.value})}
                                placeholder="Prénom"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                            <input
                                type="text"
                                value={inviteForm.lastName}
                                onChange={e => setInviteForm({...inviteForm, lastName: e.target.value})}
                                placeholder="Nom"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-sm"
                            />
                        </div>
                        {/* Membership Service — pleine largeur */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Membership Service
                            </label>
                            <input
                                type="text"
                                value={inviteForm.membershipService}
                                onChange={e => setInviteForm({...inviteForm, membershipService: e.target.value})}
                                placeholder="ex: SENELEC, ASER, Ministère de l'Énergie..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => {
                                setShowInvite(false);
                                setInviteForm({ email: '', firstName: '', lastName: '', role: 'user', membershipService: '' });
                            }}
                            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleInvite}
                            disabled={inviteLoading}
                            className="px-4 py-2 text-sm bg-[#003366] text-white rounded-md hover:bg-[#002244] disabled:opacity-50"
                        >
                            {inviteLoading ? 'Envoi...' : "Envoyer l'invitation"}
                        </button>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Chargement...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-[#003366] text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                                                {u.firstName?.charAt(0)?.toUpperCase() || <User size={16} />}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {u.fullName || 'Sans nom'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {u.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {u.membershipService || '—'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RoleBadge role={u.role} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleDelete(u.id, u.fullName)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading && filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-gray-500">Aucun utilisateur trouvé.</div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;