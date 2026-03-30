import React from 'react';
import { Users, Award } from 'lucide-react';

export default function ActiveBuilders() {
    const builders = [
        { id: 1, name: "Alice Dev", role: "Fullstack Developer", projects: 12 },
        { id: 2, name: "Bob Builder", role: "UI/UX Designer", projects: 8 },
        { id: 3, name: "Charlie Code", role: "Backend Engineer", projects: 5 },
    ];

    return (
        <div className="active-builders sketch-card mb-4">
            <h3 className="section-title handwriting">
                <Users size={20} className="section-icon" /> Active Builders
            </h3>
            <div className="builders-list mt-3">
                {builders.map(builder => (
                    <div 
                        key={builder.id} 
                        className="builder-item d-flex align-items-center mb-3 p-2 rounded pointer explore-hover" 
                        style={{ cursor: 'pointer', transition: 'background-color 0.2s', ':hover': { backgroundColor: 'rgba(0,0,0,0.05)' } }}
                    >
                        <img 
                            src={`https://api.dicebear.com/7.x/micah/svg?seed=${builder.name}&backgroundColor=transparent`} 
                            alt={builder.name} 
                            className="avatar me-3" 
                            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--primary-color)', objectFit: 'cover' }}
                        />
                        <div className="builder-info flex-grow-1">
                            <h6 className="mb-0 fw-bold">{builder.name}</h6>
                            <small className="text-muted">{builder.role}</small>
                        </div>
                        <div className="builder-stats text-end">
                            <span className="badge bg-light text-dark border">
                                <Award size={12} className="me-1" />
                                {builder.projects}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
