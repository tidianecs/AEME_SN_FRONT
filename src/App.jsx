import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/navbar';
import Dashboard from './pages/dashboard';
import ReportsList from './pages/reports/reportsList';
import NewReport from './pages/reports/newReport';
import ReportDetails from './pages/reports/reportDetails';
import MeetingsList from './pages/meetings/meetingsList';
import NewMeeting from './pages/meetings/newMeeting';
import MeetingRoom from './pages/meetings/meetingRoom';
import Chat from './pages/chat/Chat';
import AdminUsers from './pages/admin/AdminUser';

function App() {
    const { isLoading, isAdmin } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-[#003366] font-semibold text-lg">Chargement...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/reports" element={<ReportsList />} />
                    <Route path="/reports/new" element={<NewReport />} />
                    <Route path="/reports/:id" element={<ReportDetails />} />
                    <Route path="/meetings" element={<MeetingsList />} />
                    <Route path="/meetings/new" element={<NewMeeting />} />
                    <Route path="/meetings/:id" element={<MeetingRoom />} />
                    <Route path="/chat" element={<Chat />} />
                    {/* Routes admin — redirige si pas admin */}
                    <Route
                        path="/admin/users"
                        element={isAdmin ? <AdminUsers /> : <Navigate to="/dashboard" replace />}
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App;