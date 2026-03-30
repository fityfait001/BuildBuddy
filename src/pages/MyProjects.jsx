import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppNavbar from '../components/layout/AppNavbar';
import { useAuth } from '../contexts/AuthContext';
import { getUserProjects, getProjectById } from '../services/projectService';
import { getManageableApplications, getUserApplications } from '../services/applicationService';
import ProjectCard from '../components/project/ProjectCard';
import './MyProjects.css';

export default function MyProjects() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('my_builds');
    const [myBuilds, setMyBuilds] = useState([]);
    const [joinedBuilds, setJoinedBuilds] = useState([]);
    const [appliedProjects, setAppliedProjects] = useState([]);
    const [fetchedPendingRequests, setFetchedPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) return;

        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                // Fetch all data in parallel
                const [allProjects, manageableApps, userAppsData] = await Promise.all([
                    getUserProjects(currentUser.uid),
                    getManageableApplications(currentUser.uid),
                    getUserApplications(currentUser.uid)
                ]);

                const owned = allProjects.filter(p => p.ownerId === currentUser.uid || p.creator_id === currentUser.uid);
                const joined = allProjects.filter(p => p.ownerId !== currentUser.uid && p.creator_id !== currentUser.uid);

                setMyBuilds(owned);
                setJoinedBuilds(joined);

                const pending = manageableApps.filter(app => app.status === 'pending');
                setFetchedPendingRequests(pending);

                // From origin/main
                const pendingOutgoingRequests = userAppsData.filter(app => app.status === 'pending');
                const appliedProjectsData = await Promise.all(
                    pendingOutgoingRequests.map(async (app) => {
                        try {
                            const projectData = await getProjectById(app.projectId);
                            return { ...projectData, applicationStatus: app.status, appliedAt: app.createdAt };
                        } catch (err) {
                            console.warn("Could not fetch project details for applied project", app.projectId);
                            return null;
                        }
                    })
                );
                setAppliedProjects(appliedProjectsData.filter(Boolean));
            } catch (err) {
                console.error("Error fetching projects and requests:", err);
                setError("Failed to load your projects.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [currentUser]);

    const activeBuildsCount = myBuilds.filter(p => p.status === 'active' || p.recruiting !== false).length;

    const openRolesCount = myBuilds.reduce((sum, p) => {
        const teamSize = p.teamSize || 4;
        const memberCount = p.members?.length || 1;
        const openSpots = Math.max(0, teamSize - memberCount);
        return sum + openSpots;
    }, 0);

    const pendingRequestsCount = myBuilds.reduce((sum, p) => {
        if (p.pending_requests !== undefined) {
            return sum + p.pending_requests.length;
        }
        return sum;
    }, 0) || fetchedPendingRequests.length;

    const formatNumber = (num) => num.toString().padStart(2, '0');

    let currentProjects = [];
    if (activeTab === 'my_builds') currentProjects = myBuilds;
    else if (activeTab === 'joined_builds') currentProjects = joinedBuilds;
    else if (activeTab === 'applied_builds') currentProjects = appliedProjects;

    return (
        <div className="page-wrapper">
            <AppNavbar />

            <main className="my-projects-container">
                <div className="header-flex-row">
                    <h1 className="text-4xl md:text-5xl font-black uppercase text-primary-ink tracking-wide font-heading m-0">
                        MY PROJECTS
                    </h1>
                    <button
                        onClick={() => navigate('/projects/new')}
                        className="btn-sketch-red"
                    >
                        + New Build
                    </button>
                </div>

                <div className="tabs-container">
                    <button
                        className={`tab-button ${activeTab === 'my_builds' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my_builds')}
                    >
                        My Builds ({myBuilds.length})
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'joined_builds' ? 'active' : ''}`}
                        onClick={() => setActiveTab('joined_builds')}
                    >
                        Joined Builds ({joinedBuilds.length})
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'applied_builds' ? 'active' : ''}`}
                        onClick={() => setActiveTab('applied_builds')}
                    >
                        Pending Applications ({appliedProjects.length})
                    </button>
                </div>

                {error && <div className="sketch-card error-card error-message">{error}</div>}

                {loading ? (
                    <div className="loading-container">
                        <h3 className="handwriting text-muted">Loading builds...</h3>
                    </div>
                ) : (
                    <div className="mt-6"> {/* Tabs -> Stats: 24px (mt-6) */}
                        {/* Stats Section */}
                        {activeTab === 'my_builds' && (
                            <>
                                <div className="stats-grid mt-6">
                                    <div className="stat-box stat-box-active">
                                        <h4 className="stat-title">ACTIVE BUILDS</h4>
                                        <div className="stat-value text-primary-ink">{formatNumber(activeBuildsCount)}</div>
                                    </div>
                                    <div className="stat-box stat-box-roles">
                                        <h4 className="stat-title">OPEN ROLES</h4>
                                        <div className="stat-value stat-value-roles">{formatNumber(openRolesCount)}</div>
                                    </div>
                                    <div className="stat-box stat-box-pending" onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }}>
                                        <h4 className="stat-title">PENDING REQUESTS</h4>
                                        <div className="stat-value text-primary-ink">{formatNumber(pendingRequestsCount)}</div>
                                    </div>
                                </div>

                                {/* Stats -> Divider: 32px (mt-8) */}
                                <div className="divider"></div>
                            </>
                        )}

                        {/* Projects Grid */}
                        <div className={`projects-grid ${activeTab === 'my_builds' ? 'mt-8' : 'mt-2'}`}>
                            {currentProjects.map(project => (
                                <ProjectCard key={project.id} project={project} />
                            ))}

                            {activeTab === 'my_builds' && (
                                <div
                                    onClick={() => navigate('/projects/new')}
                                    className="placeholder-card"
                                >
                                    <span className="placeholder-text">START A NEW PROJECT</span>
                                </div>
                            )}

                            {activeTab === 'joined_builds' && currentProjects.length === 0 && (
                                <div className="empty-state">
                                    <h3 className="handwriting text-muted mb-4">You haven't joined any builds yet.</h3>
                                    <button onClick={() => navigate('/explore')} className="btn-sketch-red px-6 py-3 mx-auto empty-state-btn">
                                        Explore Builds
                                    </button>
                                </div>
                            )}

                            {activeTab === 'applied_builds' && currentProjects.length === 0 && (
                                <div className="empty-state">
                                    <h3 className="handwriting text-muted mb-4">You have no pending applications.</h3>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}