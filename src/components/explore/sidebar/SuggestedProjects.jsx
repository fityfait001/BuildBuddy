import React from 'react';
import { FolderHeart, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SuggestedProjects() {
    const projects = [
        { id: 1, title: "EcoTrack API", tech: "Node.js" },
        { id: 2, title: "Focus Timer 2.0", tech: "React" },
        { id: 3, title: "Gym Bro App", tech: "Flutter" }
    ];

    return (
        <div className="suggested-projects sketch-card">
            <h3 className="section-title handwriting">
                <FolderHeart size={20} className="section-icon" /> Suggested Projects
            </h3>
            <div className="suggestions-list mt-3">
                {projects.map(proj => (
                    <div key={proj.id} className="suggestion-item d-flex justify-content-between align-items-center mb-2 p-2 rounded" style={{ backgroundColor: 'var(--bg-color)' }}>
                        <div>
                            <h6 className="mb-0 fw-bold">{proj.title}</h6>
                            <small className="text-muted">{proj.tech}</small>
                        </div>
                        <Link to="#" className="btn btn-sm btn-outline-dark p-1">
                            <ChevronRight size={16} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
