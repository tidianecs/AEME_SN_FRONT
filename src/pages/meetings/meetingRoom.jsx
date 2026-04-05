import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Users } from 'lucide-react';
import { getMeetingById, updateMeetingStatus } from '../../services/meetingService';
import { useAuth } from '../../context/AuthContext';

const MeetingRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);

    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchMeeting();
        return () => {
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
            }
        };
    }, [id]);

    const fetchMeeting = async () => {
        try {
            const data = await getMeetingById(id);
            setMeeting(data);
            if (data.status === 'SCHEDULED' && data.createdByUserId === user?.id) {
                await updateMeetingStatus(id, 'IN_PROGRESS');
            }
            loadJitsiScript(data);
        } catch (err) {
            navigate('/meetings');
        } finally {
            setLoading(false);
        }
    };

    const loadJitsiScript = (meetingData) => {
        if (document.getElementById('jitsi-script')) {
            initJitsi(meetingData);
            return;
        }
        const script = document.createElement('script');
        script.id = 'jitsi-script';
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => initJitsi(meetingData);
        document.head.appendChild(script);
    };

    const initJitsi = (meetingData) => {
        if (!jitsiContainerRef.current || jitsiApiRef.current) return;

        const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
            roomName: meetingData.roomId,
            parentNode: jitsiContainerRef.current,
            width: '100%',
            height: '100%',
            userInfo: {
                displayName: user?.fullName || 'Utilisateur',
                email: user?.email || '',
            },
            configOverwrite: {
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                enableWelcomePage: false,
                prejoinPageEnabled: false,
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_BRAND_WATERMARK: false,
                DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'desktop',
                    'fullscreen', 'fodeviceselection',
                    'hangup', 'chat', 'raisehand',
                    'videoquality', 'tileview',
                ],
            },
        });

        // Redirige dès que le user quitte — avant que la page JaaS s'affiche
        api.addEventListener('videoConferenceLeft', async () => {
            api.dispose();
            jitsiApiRef.current = null;
            if (meetingData.createdByUserId === user?.id) {
                await updateMeetingStatus(id, 'ENDED');
            }
            navigate('/meetings');
        });

        // Fallback
        api.addEventListener('readyToClose', async () => {
            if (meetingData.createdByUserId === user?.id) {
                await updateMeetingStatus(id, 'ENDED');
            }
            navigate('/meetings');
        });

        jitsiApiRef.current = api;
    };

    const handleCopyUrl = () => {
        if (!meeting) return;
        navigator.clipboard.writeText(meeting.jitsiUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-400">Chargement du meeting...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/meetings')}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-primary">
                            Meeting #{meeting?.id}
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{formatDate(meeting?.scheduledAt)}</span>
                            <span>·</span>
                            <div className="flex items-center gap-1">
                                <Users size={14} />
                                <span>{meeting?.participantIds?.length} participant(s)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleCopyUrl}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    {copied
                        ? <><Check size={16} className="text-green-500" /> Lien copié !</>
                        : <><Copy size={16} /> Copier le lien</>
                    }
                </button>
            </div>

            {/* Jitsi container */}
            <div
                ref={jitsiContainerRef}
                className="w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                style={{ height: 'calc(100vh - 200px)' }}
            />
        </div>
    );
};

export default MeetingRoom;