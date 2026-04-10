import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Mail, User, Building2, Shield, 
    Star, LogOut, Loader2, Hash, Copy, Check, MapPin, X, Search
} from 'lucide-react';
import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateMyLocation } from '../services/profileService';
import keycloak from '../Keycloak';

// Fix icône Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const SENEGAL_CENTER = [14.4974, -14.4524];
const API_URL = import.meta.env.VITE_API_URL;

const LocationPicker = ({ onPick }) => {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        }
    });
    return null;
};

const MapRecenter = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) map.flyTo(coords, 16);
    }, [coords]);
    return null;
};

const Profile = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationSaved, setLocationSaved] = useState(false);
    const [pickedCoords, setPickedCoords] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        getUserProfile()
            .then(data => {
                setProfile(data);
                if (data.serviceLatitude && data.serviceLongitude) {
                    setPickedCoords([
                        parseFloat(data.serviceLatitude),
                        parseFloat(data.serviceLongitude)
                    ]);
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const getInitial = () => {
        if (profile?.firstName) return profile.firstName.charAt(0).toUpperCase();
        if (profile?.username)  return profile.username.charAt(0).toUpperCase();
        return '?';
    };

    const handleCopyId = () => {
        navigator.clipboard.writeText(profile?.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePickLocation = async (lat, lng) => {
        setPickedCoords([lat, lng]);
        try {
            await updateMyLocation(lat, lng);
            setLocationSaved(true);
            setTimeout(() => setLocationSaved(false), 2000);
        } catch {
            alert('Erreur lors de la sauvegarde de la position');
        }
    };

    const handleSearch = async (query) => {
        if (!query.trim() || query.length < 3) {
            setSearchResults([]);
            return;
        }
        try {
            setSearching(true);
            const res = await fetch(
                `${API_URL}/geocode/search?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        Authorization: `Bearer ${keycloak.token}`
                    }
                }
            );
            const data = await res.json();
            setSearchResults(data);
        } catch {
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSearchInput = (val) => {
        setSearchQuery(val);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            handleSearch(val);
        }, 500);
    };

    const handleSelectResult = async (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setPickedCoords([lat, lng]);
        setSearchQuery(result.display_name.split(',')[0]);
        setSearchResults([]);
        try {
            await updateMyLocation(lat, lng);
            setLocationSaved(true);
            setTimeout(() => setLocationSaved(false), 2000);
        } catch {
            alert('Erreur lors de la sauvegarde de la position');
        }
    };

    const handleCloseModal = () => {
        setShowLocationModal(false);
        setSearchQuery('');
        setSearchResults([]);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };

    const ScoreBadge = ({ score }) => {
        const color = score >= 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100';
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${color}`}>
                {score >= 0 ? '+' : ''}{score} pts
            </span>
        );
    };

    const RoleBadge = ({ role }) => {
        if (role === 'admin') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <Shield size={14} />
                    Admin
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200">
                <User size={14} />
                Utilisateur
            </span>
        );
    };

    const getDisplayService = (u) => {
        return (u?.membershipService && u.membershipService.trim() !== "")
            ? u.membershipService
            : "Aucun service assigné";
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    if (error) return <div className="p-4 text-red-600 font-medium">{error}</div>;

    const displayService = getDisplayService(profile);
    const displayName = profile?.fullName
        || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()
        || 'Utilisateur';
    const hasLocation = profile?.serviceLatitude && profile?.serviceLongitude;

    return (
        <>
            <div className="max-w-lg mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-md hover:bg-gray-200 transition-colors text-gray-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-primary">Mon profil</h1>
                </div>

                {/* Identification Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-24 bg-primary" />
                    <div className="px-6 pb-8 text-center">
                        <div className="flex justify-center -mt-10 mb-4">
                            <div className="h-24 w-24 rounded-full bg-accent border-4 border-white flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-4xl">
                                    {getInitial()}
                                </span>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                        <p className="text-sm text-gray-500 mb-6">{displayService}</p>
                        <div className="flex items-center justify-center gap-2">
                            <ScoreBadge score={profile?.score ?? 0} />
                            <RoleBadge role={profile?.role} />
                        </div>
                    </div>
                </div>

                {/* Infos détaillées */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                        Infos détaillées
                    </h3>

                    {/* Mon ID */}
                    <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0 text-primary">
                            <Hash size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Mon ID</p>
                            <p className="text-sm font-medium text-gray-800 truncate">{profile?.id || '—'}</p>
                        </div>
                        <button
                            onClick={handleCopyId}
                            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                            title="Copier l'ID"
                        >
                            {copied
                                ? <Check size={15} className="text-green-500" />
                                : <Copy size={15} className="text-gray-400 hover:text-primary" />
                            }
                        </button>
                    </div>

                    {/* Autres infos */}
                    {[
                        { label: 'Username', value: profile?.username,  icon: User },
                        { label: 'Email',    value: profile?.email,     icon: Mail },
                        { label: 'Prénom',   value: profile?.firstName, icon: User },
                        { label: 'Nom',      value: profile?.lastName,  icon: User },
                        { label: 'Service',  value: displayService,     icon: Building2 },
                        { label: 'Score',    value: `${profile?.score ?? 0} points`, icon: Star },
                    ].map((info, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0 text-primary">
                                <info.icon size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 uppercase font-bold">{info.label}</p>
                                <p className="text-sm font-medium text-gray-800 truncate">{info.value || '—'}</p>
                            </div>
                        </div>
                    ))}

                    {/* Bouton localiser */}
                    {displayService !== 'Aucun service assigné' && (
                        <div className="pt-2 border-t border-gray-50">
                            <button
                                onClick={() => setShowLocationModal(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl transition-colors text-sm font-medium"
                            >
                                <MapPin size={15} />
                                {hasLocation
                                    ? 'Modifier la position de mon service'
                                    : 'Localiser mon service sur la carte'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Logout */}
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-6 py-4 bg-white text-red-500 hover:bg-red-50 transition-colors rounded-3xl shadow-sm border border-gray-100 group"
                >
                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500 group-hover:scale-110 transition-transform">
                        <LogOut size={18} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold">Déconnexion</p>
                        <p className="text-[10px] text-gray-400">Fermer la session actuelle</p>
                    </div>
                </button>
            </div>

            {/* Modal Localisation */}
            {showLocationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">

                        {/* Header modal */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-primary">
                                    Localiser mon service
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Recherchez ou cliquez sur la carte pour{' '}
                                    <strong>{displayService}</strong>
                                </p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search bar */}
                        <div className="px-4 py-3 border-b border-gray-100 relative">
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                <Search size={15} className="text-gray-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un lieu au Sénégal... (min. 3 caractères)"
                                    value={searchQuery}
                                    onChange={(e) => handleSearchInput(e.target.value)}
                                    className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                                />
                                {searching && (
                                    <Loader2 size={14} className="animate-spin text-gray-400 flex-shrink-0" />
                                )}
                                {searchQuery && !searching && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSearchResults([]);
                                            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                                        }}
                                    >
                                        <X size={14} className="text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>

                            {/* Résultats */}
                            {searchResults.length > 0 && (
                                <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[1000] overflow-hidden">
                                    {searchResults.map((result, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSelectResult(result)}
                                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {result.display_name.split(',')[0]}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">
                                                {result.display_name}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Aucun résultat */}
                            {!searching && searchQuery.length >= 3 && searchResults.length === 0 && (
                                <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[1000] px-4 py-3">
                                    <p className="text-sm text-gray-400 text-center">
                                        Aucun résultat — cliquez directement sur la carte
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Map */}
                        <div style={{ height: '360px' }}>
                            <MapContainer
                                center={pickedCoords || SENEGAL_CENTER}
                                zoom={pickedCoords ? 14 : 7}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationPicker onPick={handlePickLocation} />
                                <MapRecenter coords={pickedCoords} />
                                {pickedCoords && (
                                    <Marker position={pickedCoords} />
                                )}
                            </MapContainer>
                        </div>

                        {/* Footer modal */}
                        <div className="px-6 py-4 border-t border-gray-100 text-center">
                            {locationSaved ? (
                                <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-2">
                                    <Check size={16} />
                                    Position sauvegardée !
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400">
                                    Recherchez un lieu ou cliquez directement sur la carte
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;