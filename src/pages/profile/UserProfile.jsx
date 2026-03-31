import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, User, Building2, Shield, Star, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const UserProfile = () => {
    const navigate = useNavigate();
    const { user, isAdmin, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const keycloak = (await import('../../Keycloak')).default;
            const response = await fetch(`${API_URL}/me/profile`, {
                headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            if (!response.ok) throw new Error();
            const data = await response.json();
            setProfile(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getInitial = () => {
        if (profile?.firstName) return profile.firstName.charAt(0).toUpperCase();
        if (profile?.username) return profile.username.charAt(0).toUpperCase();
        return '?';
    };

    const ScoreBadge = ({ score }) => {
        const color = score >= 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100';
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
                {score >= 0 ? '+' : ''}{score} pts
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Chargement du profil...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-md hover:bg-gray-200 transition-colors text-gray-600"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-[#003366]">Mon profil</h1>
            </div>

            {/* Card principale */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-24 bg-[#003366]" />
                <div className="px-6 pb-6">
                    <div className="flex items-end justify-between -mt-10 mb-4">
                        <div className="h-20 w-20 rounded-full bg-[#FFCC00] border-4 border-white flex items-center justify-center shadow-sm">
                            <span className="text-[#003366] font-bold text-3xl">
                                {getInitial()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <ScoreBadge score={profile?.score ?? 0} />
                            {isAdmin && (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                    <Shield size={14} />
                                    Admin
                                </span>
                            )}
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                        {profile?.fullName || 'Sans nom'}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {profile?.membershipService || 'Aucun service assigné'}
                    </p>
                </div>
            </div>

            {/* Infos détaillées */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100">
                <div className="px-6 py-4 flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-[#003366]" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Username</p>
                        <p className="text-sm font-medium text-gray-800">{profile?.username || '—'}</p>
                    </div>
                </div>
                <div className="px-6 py-4 flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Mail size={16} className="text-[#003366]" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-800">{profile?.email || '—'}</p>
                    </div>
                </div>
                <div className="px-6 py-4 flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-[#003366]" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Prénom</p>
                        <p className="text-sm font-medium text-gray-800">{profile?.firstName || '—'}</p>
                    </div>
                </div>
                <div className="px-6 py-4 flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-[#003366]" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Nom</p>
                        <p className="text-sm font-medium text-gray-800">{profile?.lastName || '—'}</p>
                    </div>
                </div>
                <div className="px-6 py-4 flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Building2 size={16} className="text-[#003366]" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Service</p>
                        <p className="text-sm font-medium text-gray-800">{profile?.membershipService || '—'}</p>
                    </div>
                </div>
                <div className="px-6 py-4 flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Star size={16} className="text-[#003366]" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Score</p>
                        <p className="text-sm font-medium text-gray-800">{profile?.score ?? 0} points</p>
                    </div>
                </div>
            </div>

            {/* Section déconnexion */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-6 py-4 text-red-500 hover:bg-red-50 transition-colors rounded-lg"
                >
                    <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <LogOut size={16} className="text-red-500" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium">Déconnexion</p>
                        <p className="text-xs text-gray-400">Se déconnecter de la plateforme</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default UserProfile;