import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import './ProjectCard.css';

export default function ProjectCard({ project }) {
    const navigate = useNavigate();

    // Status text formatting
    const isRecruiting = project.status === 'active' || project.recruiting !== false;
    const statusText = isRecruiting ? 'RECRUITING' : 'CLOSED';

    // Calculate team numbers
    const memberCount = project.members?.length || 1;
    const maxMembers = project.teamSize || 4;

    return (
        <div className="project-card-new">
            {/* Top row */}
            <div className="project-card-header">
                <span className={isRecruiting ? 'badge-recruiting' : 'badge-closed'}>
                    {statusText}
                </span>
                <div className="project-card-members">
                    <Users size={16} className="text-primary-ink" style={{ strokeWidth: 2.5 }} />
                    <span>{memberCount}/{maxMembers}</span>
                </div>
            </div>

            {/* Title & Subtitle */}
            <div className="project-card-body">
                <h3 className="project-card-title">
                    {project.title}
                </h3>
                <p className="project-card-subtitle">
                    {project.category || 'project'} • by {project.ownerName || 'Unknown'}
                </p>
            </div>

            {/* Tech Stack Tags */}
            <div className="project-card-tags">
                {project.techStack?.slice(0, 3).map(tech => (
                    <span key={tech} className="tech-tag-sharp">
                        {tech}
                    </span>
                ))}
                {project.techStack?.length > 3 && (
                    <span className="tech-tag-sharp">
                        +{project.techStack.length - 3}
                    </span>
                )}
            </div>

            {/* Action */}
            <button
                onClick={() => navigate(`/projects/${project.id}`)}
                className="btn-sketch-action mt-4"
            >
                OPEN BUILD
            </button>
        </div>
    );
}
