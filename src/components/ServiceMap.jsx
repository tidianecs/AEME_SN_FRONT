import { useState, useEffect } from 'react';
import { X, Loader2, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllUsersWithLocation } from '../services/profileService';

// Fix icône Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const SENEGAL_CENTER = [14.4974, -14.4524];

// Groupe les users par service — un seul marker par service
// Les coordonnées viennent du premier user qui en a
// Tous les membres du service sont listés dans le popup
const groupByService = (users) => {
    const map = {};
    users.forEach(u => {
        const svc = u.membershipService;
        if (!svc || svc.trim() === '') return;

        if (!map[svc]) {
            map[svc] = {
                service: svc,
                coords: null,
                members: []
            };
        }

        // Prend les coordonnées du premier user qui en a
        if (!map[svc].coords && u.serviceLatitude && u.serviceLongitude) {
            map[svc].coords = [
                parseFloat(u.serviceLatitude),
                parseFloat(u.serviceLongitude)
            ];
        }

        // Ajoute tous les membres peu importe s'ils ont des coordonnées
        map[svc].members.push(u.fullName || u.email);
    });

    // Ne retourne que les services qui ont au moins une coordonnée
    return Object.values(map).filter(m => m.coords !== null);
};

const ServiceMap = ({ onClose }) => {
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        getAllUsersWithLocation()
            .then(users => setMarkers(groupByService(users)))
            .catch(() => setError('Impossible de charger les positions.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-primary" />
                        <h2 className="text-lg font-bold text-primary">
                            Localisation des services
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Map */}
                <div className="relative" style={{ height: '500px' }}>
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
                            <Loader2 size={32} className="animate-spin text-primary" />
                            <p className="text-sm">Chargement des positions...</p>
                        </div>
                    ) : error ? (
                        <div className="absolute inset-0 flex items-center justify-center text-red-500 text-sm">
                            {error}
                        </div>
                    ) : markers.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                            <MapPin size={32} className="opacity-30" />
                            <p className="text-sm">Aucun service localisé pour le moment.</p>
                            <p className="text-xs text-center px-8">
                                Les membres peuvent ajouter leur position depuis leur profil.
                            </p>
                        </div>
                    ) : (
                        <MapContainer
                            center={markers.length === 1 ? markers[0].coords : SENEGAL_CENTER}
                            zoom={markers.length === 1 ? 14 : 7}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {markers.map((m, i) => (
                                <Marker key={i} position={m.coords}>
                                    <Popup>
                                        <div className="text-sm min-w-[150px]">
                                            <p className="font-bold text-primary mb-2 border-b border-gray-100 pb-1">
                                                {m.service}
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium mb-1">
                                                Membres ({m.members.length}) :
                                            </p>
                                            {m.members.map((name, j) => (
                                                <p key={j} className="text-xs text-gray-700 py-0.5">
                                                    • {name}
                                                </p>
                                            ))}
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                </div>

                {/* Footer */}
                {!loading && !error && markers.length > 0 && (
                    <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            {markers.length} service(s) localisé(s)
                        </p>
                        <p className="text-xs text-gray-400">
                            Données © OpenStreetMap
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceMap;