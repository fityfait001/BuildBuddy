import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './HomeSidebar.css';

export default function YourStackPanel() {
    const { userProfile } = useAuth();
    const skills = userProfile?.skills || ['React', 'Firebase', 'Javascript', 'CSS'];

    return (
        <div className="sketch-card your-stack-panel mt-4">
            <h3 className="panel-title handwriting mb-4">Your Stack</h3>

            <div className="tags-container">
                {skills.length > 0 ? (
                    skills.map((skill, index) => (
                        <span key={index} className="tag tag-ethereal">{skill}</span>
                    ))
                ) : (
                    <p className="text-muted text-sm">Add skills to your profile to see them here.</p>
                )}
            </div>
        </div>
    );
}
