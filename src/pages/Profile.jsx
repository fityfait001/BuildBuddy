import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppNavbar from '../components/layout/AppNavbar';
import ProjectCard from '../components/project/ProjectCard';
import { useAuth } from '../contexts/AuthContext';
import { getUserById } from '../services/userService';
import { getUserProjects } from '../services/projectService';
import { Mail, Edit3, Github } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { uid } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [profileUser, setProfileUser] = useState(null);
    const [userProjects, setUserProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadProfile() {
            try {
                setLoading(true);
                const userData = await getUserById(uid);
                const projectsData = await getUserProjects(uid);

                setProfileUser(userData);
                setUserProjects(projectsData);
            } catch (err) {
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [uid]);

    const isOwnProfile = currentUser && currentUser.uid === uid;

    if (loading) {
        return (
            <div className="profile-page">
                <AppNavbar />
                <div className="container text-center mt-4"><h2 className="handwriting">Loading profile...</h2></div>
            </div>
        );
    }

    if (error || !profileUser) {
        return (
            <div className="profile-page">
                <AppNavbar />
                <div className="container mt-4">
                    <div className="sketch-card error-card text-center">
                        <h3>Oops!</h3>
                        <p>{error || "User not found"}</p>
                    </div>
                </div>
            </div>
        );
    }

    const joinDate = profileUser.createdAt ? new Date(profileUser.createdAt.toMillis()).toLocaleDateString() : 'Unknown';

    return (
        <div className="profile-page">
            <AppNavbar />

            <div className="profile-container container">

                <aside className="sketch-card sidebar">
                    <span className="label">// The Human</span>
                    <div className="avatar-box" style={{ padding: 0, overflow: 'hidden' }}>
                        <img
                            src={`https://api.dicebear.com/7.x/micah/svg?seed=${profileUser.displayName || 'User'}&backgroundColor=transparent`}
                            alt={`${profileUser.displayName}'s Avatar`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                        />
                    </div>
                    <h1>{profileUser.displayName}</h1>
                    <div className="details">
                        {profileUser.email} <br />
                        Joined Buddy on {joinDate}
                    </div>

                    <div className="divider"></div>

                    <div className="academic-info">
                        <p className="degree-text">{profileUser.year} • {profileUser.branch}</p>
                        <p className="uni-text">{profileUser.university}</p>
                    </div>

                    <p className="bio-text">
                        <strong>Bio:</strong> {profileUser.bio || "This user hasn't written a bio yet."}
                    </p>

                    <div className="social-links">
                        {profileUser.linkedin && (
                            <a href={profileUser.linkedin} target="_blank" rel="noreferrer" className="tag social-tag">LinkedIn ↗</a>
                        )}
                        {profileUser.github && (
                            <a href={profileUser.github} target="_blank" rel="noreferrer" className="tag social-tag">GitHub ↗</a>
                        )}
                        {profileUser.portfolio && (
                            <a href={profileUser.portfolio} target="_blank" rel="noreferrer" className="tag social-tag">Portfolio ↗</a>
                        )}
                    </div>
                    
                    {!isOwnProfile && currentUser && (
                        <div className="mt-4" style={{ width: '100%' }}>
                            <button 
                                className="btn-sketch-action" 
                                style={{ width: '100%' }}
                                onClick={() => navigate('/messages', { state: { startChatWith: uid } })}
                            >
                                💬 Message Builder
                            </button>
                        </div>
                    )}
                </aside>

                <main className="main-content">
                    <div className="bento-grid">
                        <section className="sketch-card project-area">
                            {isOwnProfile && <Link to="/settings" className="btn-edit text-decoration-none">✎ Edit Profile</Link>}

                            <div className="mb-5 pb-5 border-b-2 border-[#111827] w-100">
                                <span className="label project-label fw-bold mb-4" style={{ fontSize: '1.4rem', color: '#111827' }}>// Builder Medals 🎖️</span>
                                <div className="stats-row-grid">
                                    <div className="stat-badge">
                                        <div className="stat-value">{userProjects.length}</div>
                                        <div className="stat-label">Total Projects</div>
                                    </div>
                                    <div className="stat-badge" style={{ backgroundColor: '#ccff00' }}>
                                        <div className="stat-value" style={{ color: '#111827' }}>{userProjects.filter(p => p.ownerId === uid || p.creator_id === uid).length}</div>
                                        <div className="stat-label" style={{ color: '#111827' }}>Builds Led 🔨</div>
                                    </div>
                                    <div className="stat-badge" style={{ backgroundColor: '#4ddbff' }}>
                                        <div className="stat-value" style={{ color: '#111827' }}>{userProjects.filter(p => p.ownerId !== uid && p.creator_id !== uid).length}</div>
                                        <div className="stat-label" style={{ color: '#111827' }}>Contributions 🤝</div>
                                    </div>
                                </div>
                            </div>

                            <span className="label project-label fw-bold w-100 mb-4" style={{ fontSize: '1.4rem', color: '#111827' }}>// Recent Activity</span>

                            {userProjects.length === 0 ? (
                                <div className="empty-projects-wrapper w-100">
                                    <h3 className="empty-projects-title">Scanning for active builds...</h3>
                                    <p className="empty-projects-desc">Not part of any projects yet.</p>
                                    {isOwnProfile && (
                                        <a href="/projects/new" className="btn btn-primary mt-3 inline-block">
                                            <span>🚀</span> Create Project
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div className="projects-lists-container mt-4">
                                    <div className="project-columns-grid">
                                        <div className="project-category">
                                            <h4 className="fw-black text-uppercase mb-3" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>Builds Led</h4>
                                            <div className="project-category-links">
                                                {userProjects.filter(p => p.ownerId === uid || p.creator_id === uid).slice(0, 6).map(project => (
                                                    <Link key={project.id} to={`/projects/${project.id}`} className="project-anchor-link">
                                                        <span className="project-anchor-title">{project.title}</span>
                                                        <span className="project-anchor-status tag tag-sketch ms-auto" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                                                            {project.status || 'Active'}
                                                        </span>
                                                    </Link>
                                                ))}
                                                {userProjects.filter(p => p.ownerId === uid || p.creator_id === uid).length === 0 && (
                                                    <div className="text-muted fst-italic py-2" style={{ fontSize: '0.9rem' }}>No builds led yet.</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="project-category">
                                            <h4 className="fw-black text-uppercase mb-3" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>Contributions</h4>
                                            <div className="project-category-links">
                                                {userProjects.filter(p => p.ownerId !== uid && p.creator_id !== uid).slice(0, 6).map(project => (
                                                    <Link key={project.id} to={`/projects/${project.id}`} className="project-anchor-link">
                                                        <span className="project-anchor-title">{project.title}</span>
                                                        <span className="project-anchor-status tag tag-sketch ms-auto" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                                                            Member
                                                        </span>
                                                    </Link>
                                                ))}
                                                {userProjects.filter(p => p.ownerId !== uid && p.creator_id !== uid).length === 0 && (
                                                    <div className="text-muted fst-italic py-2" style={{ fontSize: '0.9rem' }}>No standard contributions yet.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="sketch-card skills-card">
                            <span className="label">// Skills & Stack</span>
                            <div className="skills-tags mt-3">
                                {profileUser.skills && profileUser.skills.length > 0 ? (
                                    profileUser.skills.map(skill => (
                                        <span key={skill} className="tag tag-sketch">#{skill}</span>
                                    ))
                                ) : (
                                    <p className="empty-text">No skills added yet.</p>
                                )}
                            </div>
                        </section>

                        <section className="sketch-card academic-card">
                            <span className="label academic-label">// Academic Focus</span>
                            <p className="degree-title">{profileUser.degree} {profileUser.branch}</p>
                            <p className="degree-subtitle">Specializing at {profileUser.university}</p>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Profile;
