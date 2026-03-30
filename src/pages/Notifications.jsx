import React, { useState, useEffect } from 'react';
import AppNavbar from '../components/layout/AppNavbar';
import { useAuth } from '../contexts/AuthContext';
import {
    getManageableApplications,
    getUserApplications,
    acceptApplication,
    rejectApplication
} from '../services/applicationService';
import { getUserNotifications } from '../services/notificationService';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock } from 'lucide-react';
import './Notifications.css';

export default function Notifications() {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('incoming'); // 'incoming', 'outgoing', or 'alerts'

    const [incomingApps, setIncomingApps] = useState([]);
    const [outgoingApps, setOutgoingApps] = useState([]);
    const [systemAlerts, setSystemAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        loadData();
    }, [currentUser]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [incoming, outgoing, alerts] = await Promise.all([
                getManageableApplications(currentUser.uid),
                getUserApplications(currentUser.uid),
                getUserNotifications(currentUser.uid)
            ]);
            setIncomingApps(incoming);
            setOutgoingApps(outgoing);
            setSystemAlerts(alerts);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (appId, projectId, applicantId) => {
        try {
            await acceptApplication(appId, projectId, applicantId);
            // Optimistically update UI
            setIncomingApps(prev => prev.filter(app => app.id !== appId));
        } catch (err) {
            console.error("Error accepting:", err);
            alert("Failed to accept application.");
        }
    };

    const handleReject = async (appId) => {
        try {
            await rejectApplication(appId);
            // Optimistically update UI
            setIncomingApps(prev => prev.filter(app => app.id !== appId));
        } catch (err) {
            console.error("Error rejecting:", err);
            alert("Failed to reject application.");
        }
    };

    const renderIncoming = () => {
        if (incomingApps.length === 0) {
            return (
                <div className="sketch-card text-center py-5 mt-4">
                    <h3 className="handwriting text-accent">All caught up!</h3>
                    <p>You don't have any pending project applications to review right now.</p>
                </div>
            );
        }

        return incomingApps.map(app => (
            <div key={app.id} className="sketch-card application-card mb-4">
                <div className="flex justify-between items-start mb-3 border-b border-dashed pb-3">
                    <div className="flex items-center gap-3">
                        <div className="app-avatar-wrapper">
                            {app.applicantPhoto ? (
                                <img src={app.applicantPhoto} alt={app.applicantName} className="app-avatar-img" />
                            ) : (
                                <div className="app-avatar-fallback font-heading font-bold text-lg">
                                    {app.applicantName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <Link to={`/profile/${app.applicantId}`} className="font-heading font-bold text-lg hover-accent">
                                {app.applicantName}
                            </Link>
                            <p className="text-sm text-muted">applied to join <Link to={`/projects/${app.projectId}`} className="font-bold underline">{app.projectTitle}</Link></p>
                        </div>
                    </div>
                </div>

                {app.message && (
                    <div className="app-message mb-4">
                        <strong className="block mb-1 text-sm font-heading">Message:</strong>
                        <p className="text-sm bg-gray-50 p-3 rounded">{app.message}</p>
                    </div>
                )}

                <div className="flex gap-3 justify-end mt-4">
                    <button
                        className="btn btn-secondary px-6"
                        onClick={() => handleReject(app.id)}
                    >
                        Decline
                    </button>
                    <button
                        className="btn btn-primary px-6"
                        onClick={() => handleAccept(app.id, app.projectId, app.applicantId)}
                    >
                        Accept Member
                    </button>
                </div>
            </div>
        ));
    };

    const renderOutgoing = () => {
        if (outgoingApps.length === 0) {
            return (
                <div className="sketch-card text-center py-5 mt-4">
                    <h3 className="handwriting text-accent">No applications yet.</h3>
                    <p>Head over to the Home feed to find projects to join!</p>
                </div>
            );
        }

        return outgoingApps.map(app => (
            <div key={app.id} className="sketch-card application-card mb-4 flex justify-between items-center">
                <div>
                    <h3 className="font-heading font-bold text-lg mb-1">
                        <Link to={`/projects/${app.projectId}`} className="hover-accent">{app.projectTitle}</Link>
                    </h3>
                    <p className="text-sm text-muted">
                        Applied on {app.createdAt?.toDate().toLocaleDateString() || 'Recently'}
                    </p>
                </div>
                <div>
                    <span className={`status-badge status-${app.status}`}>
                        {app.status.toUpperCase()}
                    </span>
                </div>
            </div>
        ));
    };

    const renderAlerts = () => {
        if (systemAlerts.length === 0) {
            return (
                <div className="sketch-card text-center py-5 mt-4">
                    <h3 className="handwriting text-accent">No alerts.</h3>
                    <p>You have no system alerts right now.</p>
                </div>
            );
        }

        return systemAlerts.map(alert => (
            <div key={alert.id} className={`sketch-card application-card mb-4 flex justify-between items-start ${!alert.read ? 'border-primary-ink border-[2px]' : ''}`}>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={18} className="text-red-500" />
                        <h3 className="font-heading font-bold text-lg text-primary-ink m-0 leading-none">
                            Project Deleted
                        </h3>
                    </div>
                    <p className="text-gray-700 font-medium mb-3 relative top-[5px]">
                        {alert.message}
                    </p>
                    <p className="text-xs text-muted flex items-center gap-1 font-bold tracking-wide">
                        <Clock size={12} /> {alert.createdAt?.toDate().toLocaleString() || 'Recently'}
                    </p>
                </div>
                {!alert.read && (
                    <div className="bg-primary-ink w-3 h-3 rounded-full mt-2"></div>
                )}
            </div>
        ));
    };

    return (
        <div className="page-wrapper min-h-screen bg-bg-color">
            <AppNavbar />

            <main className="container max-w-3xl py-8 mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold mb-2">Team & Applications</h1>
                    <p className="text-muted">Manage the builders you recruit and the projects you've applied to.</p>
                </div>

                <div className="tabs-container mb-6 flex gap-4 border-b-2 border-primary-ink">
                    <button
                        className={`tab-btn ${activeTab === 'incoming' ? 'active' : ''}`}
                        onClick={() => setActiveTab('incoming')}
                    >
                        Incoming Requests
                        {incomingApps.length > 0 && <span className="badge-count ml-2">{incomingApps.length}</span>}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'outgoing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('outgoing')}
                    >
                        My Applications
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('alerts')}
                    >
                        System Alerts
                        {systemAlerts.filter(a => !a.read).length > 0 && (
                            <span className="badge-count ml-2">{systemAlerts.filter(a => !a.read).length}</span>
                        )}
                    </button>
                </div>

                {loading ? (
                    <div className="sketch-card text-center py-5">
                        <h3 className="handwriting">Loading applications...</h3>
                    </div>
                ) : (
                    <div className="tab-content">
                        {activeTab === 'incoming' ? renderIncoming() : activeTab === 'outgoing' ? renderOutgoing() : renderAlerts()}
                    </div>
                )}
            </main>
        </div>
    );
}
