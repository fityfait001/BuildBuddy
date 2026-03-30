import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CreatePostModal from './CreatePostModal';

export default function CreatePostBox() {
    const { currentUser, userProfile } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const avatarLetter = userProfile?.displayName?.charAt(0).toUpperCase() || currentUser?.displayName?.charAt(0).toUpperCase() || 'U';

    return (
        <>
            <div className="sketch-card idea-input-container mb-4" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '1rem 1.5rem', 
                borderStyle: 'dashed', 
                borderWidth: '2px',
                backgroundColor: 'var(--bg-color)' 
            }}>
                <div style={{
                    width: '48px', height: '48px', minWidth: '48px', borderRadius: '50%',
                    backgroundColor: 'white', border: '2px solid var(--primary-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-headings)', fontWeight: '800', fontSize: '1.25rem',
                    color: 'var(--primary-color)'
                }}>
                    {avatarLetter}
                </div>

                <div
                    className="idea-input-mock"
                    onClick={() => setIsModalOpen(true)}
                    role="button"
                    tabIndex={0}
                    style={{
                        flexGrow: 1, border: '1px solid var(--primary-color)', borderRadius: '40px',
                        padding: '0.75rem 1.5rem', cursor: 'pointer', backgroundColor: 'white',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <span className="handwriting" style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                        Got an update, question, or progress to share?
                    </span>
                </div>
            </div>

            <CreatePostModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    );
}
