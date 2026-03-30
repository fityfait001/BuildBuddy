import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppNavbar from '../components/layout/AppNavbar';
import { useAuth } from '../contexts/AuthContext';
import { getProjectById, deleteProject } from '../services/projectService';
import ApplyModal from '../components/project/ApplyModal';
import { Users, Clock, Tag, Briefcase, Wrench, Globe, Github, FileText, Layout } from 'lucide-react';
import './ProjectDetails.css';

const ProjectDetails = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    useEffect(() => {
        async function loadProject() {
            try {
                const data = await getProjectById(id);
                setProject(data);
            } catch (err) {
                setError('Failed to load project details.');
            } finally {
                setLoading(false);
            }
        }
        loadProject();
    }, [id]);

    if (loading) {
        return (
            <div className="details-page">
                <AppNavbar />
                <div className="container text-center mt-4">
                    <h2 className="handwriting">Loading project details...</h2>
                </div>
            </div>
        );
    }

    if (error || !project) {
        <div className="details-page">
            <AppNavbar />
            <div className="container mt-4">
                <div className="sketch-card error-card text-center">
                    <h3>Oops!</h3>
                    <p>{error || "Project not found"}</p>
                    <Link to="/dashboard" className="btn btn-secondary mt-3">Back to Dashboard</Link>
                </div>
            </div>
        </div>
    }

    const isOwner = currentUser.uid === project.ownerId;
    const isMember = project.members?.includes(currentUser.uid);
    const timeAgo = project.createdAt ? new Date(project.createdAt.toMillis()).toLocaleDateString() : '';
    const statusText = project.recruiting ? 'RECRUITING' : 'CLOSED';
    const badgeClass = project.recruiting ? 'badge-recruiting' : 'badge-closed';

    return (
        <div className="details-page min-h-screen bg-bg-color pb-10">
            <AppNavbar />

            <main className="details-main container mt-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="sketch-card details-header mb-6">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2 mb-2">
                            <span className={`rc-status-badge ${badgeClass}`}>{statusText}</span>
                            {project.category && (
                                <span className="tag tag-sketch capitalize">{project.category}</span>
                            )}
                            {project.difficultyLevel && (
                                <span className="tag tag-sketch capitalize">{project.difficultyLevel}</span>
                            )}
                        </div>
                        <span className="text-muted text-sm flex items-center gap-1">
                            <Clock size={14} /> {timeAgo}
                        </span>
                    </div>

                    <h1 className="text-4xl font-heading font-bold text-primary-ink mb-2">
                        {project.title}
                    </h1>
                    <p className="text-xl text-muted mb-4">{project.shortDescription}</p>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-dashed">
                        <div className="w-10 h-10 rounded-full bg-sky-color border-2 border-primary-ink flex items-center justify-center font-heading font-bold overflow-hidden">
                            {project.ownerPhoto ? (
                                <img src={project.ownerPhoto} alt={project.ownerName} className="w-full h-full object-cover" />
                            ) : (
                                project.ownerName?.charAt(0) || 'U'
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-muted m-0 leading-tight">Project Owner</p>
                            <Link to={`/profile/${project.ownerId}`} className="font-heading font-bold hover-accent transition-colors m-0 leading-tight">
                                {project.ownerName}
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="sketch-card">
                            <h3 className="text-2xl font-heading mb-4">About this Project</h3>
                            <div className="text-gray-700 leading-relaxed space-y-3">
                                {project.description?.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>

                        {(project.requiredSkills?.length > 0 || project.techStack?.length > 0) && (
                            <div className="sketch-card">
                                <h3 className="text-2xl font-heading mb-4 flex items-center gap-2">
                                    <Wrench size={20} className="text-accent" /> Tech Stack & Skills
                                </h3>

                                {project.techStack?.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Tech Stack</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {project.techStack.map(tech => (
                                                <span key={tech} className="px-3 py-1 bg-gray-100 border border-gray-300 rounded font-mono text-sm">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {project.requiredSkills?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Required Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {project.requiredSkills.map(skill => (
                                                <span key={skill} className="px-3 py-1 bg-sky-100 border border-sky-300 rounded text-sm font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {project.tags?.length > 0 && (
                            <div className="sketch-card">
                                <h3 className="text-xl font-heading mb-3 flex items-center gap-2">
                                    <Tag size={18} className="text-accent" /> Discovery Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map(tag => (
                                        <span key={tag} className="text-sm text-gray-600 bg-gray-50 border border-dashed border-gray-300 px-3 py-1 rounded">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="sketch-card">
                            <h3 className="text-xl font-heading mb-4 flex items-center gap-2 border-b border-dashed pb-2">
                                <Users size={20} /> Team Structure
                            </h3>

                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1 font-bold">
                                    <span>{project.members?.length || 1} Members</span>
                                    <span>{project.teamSize} Max</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 border border-primary-ink overflow-hidden">
                                    <div
                                        className="bg-accent h-3 rounded-full"
                                        style={{ width: `${Math.min(100, ((project.members?.length || 1) / (project.teamSize || 4)) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {Math.max(0, (project.teamSize || 4) - (project.members?.length || 1)) > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-bold text-muted mb-2 flex items-center gap-1">
                                        <Briefcase size={14} /> Open Roles
                                    </h4>
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                        {Math.max(0, (project.teamSize || 4) - (project.members?.length || 1))} open spots available
                                    </p>
                                    {project.openRoles?.length > 0 && (
                                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                            {project.openRoles.map((role, idx) => (
                                                <li key={idx}>{role}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <div className="mt-6">
                                {isOwner ? (
                                    <>
                                        <button className="btn w-full btn-secondary opacity-70 cursor-not-allowed mb-3" disabled>You are the creator</button>
                                        <button 
                                            onClick={async () => {
                                                if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
                                                    try {
                                                        await deleteProject(project.id, currentUser.uid);
                                                        window.location.href = '/my-projects'; // Hard redirect to guarantee state refresh
                                                    } catch (err) {
                                                        alert(err.message || 'Failed to delete project');
                                                    }
                                                }
                                            }}
                                            className="btn w-full text-lg py-3" 
                                            style={{ borderColor: '#dc2626', color: '#dc2626', backgroundColor: 'transparent' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        >
                                            Delete Project
                                        </button>
                                    </>
                                ) : isMember ? (
                                    <button className="btn w-full btn-secondary opacity-70 cursor-not-allowed" disabled>You are a member</button>
                                ) : !project.recruiting ? (
                                    <button className="btn w-full btn-secondary opacity-70 cursor-not-allowed" disabled>Recruitment Closed</button>
                                ) : (
                                    <button onClick={() => setIsApplyModalOpen(true)} className="btn btn-primary w-full text-lg py-3">
                                        Apply to Build
                                    </button>
                                )}
                            </div>
                        </div>

                        {(project.githubRepo || project.liveDemo || project.documentation || project.figma) && (
                            <div className="sketch-card">
                                <h3 className="text-xl font-heading mb-4 border-b border-dashed pb-2">Links & Resources</h3>
                                <div className="space-y-3">
                                    {project.githubRepo && (
                                        <a href={project.githubRepo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-ink hover:text-accent font-medium transition-colors">
                                            <Github size={18} /> GitHub Repository
                                        </a>
                                    )}
                                    {project.liveDemo && (
                                        <a href={project.liveDemo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-ink hover:text-accent font-medium transition-colors">
                                            <Globe size={18} /> Live Demo
                                        </a>
                                    )}
                                    {project.documentation && (
                                        <a href={project.documentation} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-ink hover:text-accent font-medium transition-colors">
                                            <FileText size={18} /> Documentation
                                        </a>
                                    )}
                                    {project.figma && (
                                        <a href={project.figma} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-ink hover:text-accent font-medium transition-colors">
                                            <Layout size={18} /> Design Prototype
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {isApplyModalOpen && (
                <ApplyModal project={project} onClose={() => setIsApplyModalOpen(false)} />
            )}
        </div>
    );
};

export default ProjectDetails;
