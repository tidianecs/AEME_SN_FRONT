import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Video, MessageSquare, User, Menu, X, ShieldCheck, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import ServiceMap from './ServiceMap';

const Navbar = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const { user, isLoading } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Reports',   path: '/reports',   icon: FileText },
        { name: 'Meetings',  path: '/meetings',  icon: Video },
        { name: 'Chat',      path: '/chat',      icon: MessageSquare },
    ];

    if (user?.isAdmin) {
        navItems.push({ name: 'Admin', path: '/admin', icon: ShieldCheck });
    }

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <>
            <nav className="bg-primary text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <Link to="/dashboard" className="flex items-center gap-3">
                            <img src="/logo.png" alt="AEME Logo" className="h-12 w-auto" />
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={clsx(
                                            'px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors',
                                            isActive(item.path)
                                                ? 'bg-primary-dark text-accent'
                                                : 'hover:bg-primary-light text-gray-200'
                                        )}
                                    >
                                        <item.icon size={18} />
                                        {item.name}
                                    </Link>
                                ))}

                                {/* Bouton Localisation */}
                                <button
                                    onClick={() => setShowMap(true)}
                                    className="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors hover:bg-primary-light text-gray-200 hover:text-white"
                                >
                                    <MapPin size={18} />
                                    Localisation
                                </button>
                            </div>
                        </div>

                        {/* Desktop Right */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link to="/profile" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-semibold">
                                        {isLoading ? '...' : (user?.fullName ?? 'Utilisateur')}
                                    </span>
                                    <span className="text-xs text-gray-300 capitalize">
                                        {user?.role || 'Energy Manager'}
                                    </span>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/10">
                                    <User size={20} />
                                </div>
                            </Link>
                        </div>

                        {/* Mobile Hamburger */}
                        <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="bg-primary-dark inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-primary-light focus:outline-none"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-primary-dark">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={clsx(
                                        'block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3',
                                        isActive(item.path)
                                            ? 'bg-primary text-accent'
                                            : 'text-gray-300 hover:bg-primary-light hover:text-white'
                                    )}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            ))}

                            {/* Mobile Localisation */}
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setShowMap(true);
                                }}
                                className="w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center gap-3 text-gray-300 hover:bg-primary-light hover:text-white"
                            >
                                <MapPin size={20} />
                                Localisation des services
                            </button>

                            {/* Mobile Profile */}
                            <div className="border-t border-gray-700 mt-4 pt-4 pb-2">
                                <div className="flex items-center justify-between px-3">
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div className="text-base font-medium text-white">
                                                {isLoading ? '...' : (user?.fullName ?? 'Utilisateur')}
                                            </div>
                                            <div className="text-sm text-gray-400 mt-1 capitalize">
                                                {user?.role || 'Energy Manager'}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Modal Map */}
            {showMap && <ServiceMap onClose={() => setShowMap(false)} />}
        </>
    );
};

export default Navbar;