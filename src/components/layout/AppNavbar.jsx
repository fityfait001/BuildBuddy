import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Search, Menu, X, Settings, LogOut, User, Home, Compass, Folder, MessageSquare } from 'lucide-react';
import './AppNavbar.css';

const AppNavbar = ({ searchQuery, onSearchChange }) => {
    const { currentUser, logout, userProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
    }, [location.pathname]);

    async function handleLogout() {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    const NavLinks = () => (
        <>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Home size={18} /> Home
            </NavLink>
            <NavLink to="/explore" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Compass size={18} /> Explore
            </NavLink>
            <NavLink to="/my-projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Folder size={18} /> My Projects
            </NavLink>
            <NavLink to="/messages" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <MessageSquare size={18} /> Messages
            </NavLink>
        </>
    );

    return (
        <nav className="app-navbar sketch-card">
            <div className="navbar-container container">

                {/* Left Section: Logo */}
                <div className="navbar-logo-container">
                    <Link to="/dashboard" className="navbar-logo">
                        Build <span className="handwriting highlight">Buddy</span>
                    </Link>
                </div>

                {/* Center Section: Desktop Navigation */}
                <div className="navbar-center hide-mobile">
                    <NavLinks />
                </div>

                {/* Right Section: Actions */}
                <div className="navbar-right">

                    <div className="search-bar-container hide-mobile">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search projects or skills..." 
                            className="search-input sketch-input" 
                            value={searchQuery !== undefined ? searchQuery : ""}
                            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                        />
                    </div>

                    <Link to="/notifications" className="icon-btn notification-bell hide-mobile">
                        <Bell size={22} />
                    </Link>

                    {/* User Avatar Dropdown */}
                    <div className="user-dropdown-container" ref={dropdownRef}>
                        <button
                            className="avatar-btn"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            aria-label="User menu"
                            style={{ padding: 0, overflow: 'hidden' }}
                        >
                            <img 
                                src={`https://api.dicebear.com/7.x/micah/svg?seed=${userProfile?.displayName || currentUser?.displayName || 'User'}&backgroundColor=transparent`} 
                                alt="User Avatar" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </button>

                        {isDropdownOpen && (
                            <div className="dropdown-menu sketch-card">
                                <Link to={`/profile/${currentUser?.uid}`} className="dropdown-item">
                                    <User size={16} /> Profile
                                </Link>
                                <Link to="/settings" className="dropdown-item">
                                    <Settings size={16} /> Settings
                                </Link>
                                <div className="dropdown-divider"></div>
                                <button onClick={handleLogout} className="dropdown-item text-danger">
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger Toggle */}
                    <button
                        className="mobile-menu-btn hide-desktop"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="mobile-nav-menu sketch-card">
                    <div className="mobile-search mb-3">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="search-input sketch-input w-100" 
                            value={searchQuery !== undefined ? searchQuery : ""}
                            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                        />
                    </div>
                    <NavLinks />
                </div>
            )}
        </nav>
    );
};

export default AppNavbar;
