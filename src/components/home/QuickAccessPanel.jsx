import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Flame, Bookmark, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProjects } from '../../services/projectService';
import { getManageableApplications } from '../../services/applicationService';
import './HomeSidebar.css';

export default function QuickAccessPanel() {
    const { currentUser } = useAuth();
    const [activeBuildsCount, setActiveBuildsCount] = useState(0);
    const [teamRequestsCount, setTeamRequestsCount] = useState(0);

    useEffect(() => {
        if (!currentUser) return;

        async function fetchStats() {
            try {
                // Fetch projects
                const allProjects = await getUserProjects(currentUser.uid);

                // Active builds logic: projects you are in where status is active/recruiting
                // Same logic as MyProjects page
                const activeProjects = allProjects.filter(
                    p => p.creator_id === currentUser.uid || p.ownerId === currentUser.uid
                ).filter(
                    p => p.status === 'active' || p.recruiting !== false
                );

                setActiveBuildsCount(activeProjects.length);

                // Fetch pending requests for your projects (Team Requests)
                const applications = await getManageableApplications(currentUser.uid);
                const pendingRequests = applications.filter(app => app.status === 'pending');
                setTeamRequestsCount(pendingRequests.length);

            } catch (error) {
                console.error("Error fetching quick access stats:", error);
            }
        }

        fetchStats();
    }, [currentUser]);

    return (
        <div className="sketch-card quick-access-panel">
            <h3 className="panel-title handwriting mb-4">Quick Access</h3>

            <div className="quick-access-list">
                <NavLink to="/my-projects" className="quick-access-item">
                    <span className="icon-wrapper"><Flame size={18} className="text-accent" /></span>
                    <span className="item-text font-bold text-accent">My Active Builds</span>
                    {activeBuildsCount > 0 && <span className="badge badge-count">{activeBuildsCount}</span>}
                </NavLink>

                <NavLink to="/saved" className="quick-access-item">
                    <span className="icon-wrapper"><Bookmark size={18} /></span>
                    <span className="item-text font-bold">Saved Projects</span>
                </NavLink>

                <NavLink to="/notifications" className="quick-access-item">
                    <span className="icon-wrapper"><Users size={18} className="text-warning" /></span>
                    <span className="item-text font-bold">Team Requests</span>
                    {teamRequestsCount > 0 && <span className="badge badge-count badge-warning">{teamRequestsCount}</span>}
                </NavLink>

                <NavLink to="/events" className="quick-access-item">
                    <span className="icon-wrapper"><GraduationCap size={18} /></span>
                    <span className="item-text font-bold">Campus Events</span>
                </NavLink>
            </div>
        </div>
    );
}
