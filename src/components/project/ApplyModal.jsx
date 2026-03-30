import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { applyToProject } from '../../services/applicationService';
import './ApplyModal.css';

const ApplyModal = ({ project, onClose }) => {
    const { currentUser, userProfile } = useAuth();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Lock background scroll when modal is open
        document.body.style.overflow = "hidden";

        return () => {
            // Restore background scroll when modal unmounts
            document.body.style.overflow = "auto";
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await applyToProject({
                projectId: project.id,
                projectTitle: project.title,
                ownerId: project.ownerId,
                applicantId: currentUser.uid,
                applicantName: currentUser.displayName || 'Anonymous Buddy',
                applicantPhoto: userProfile?.photoURL || currentUser?.photoURL || '',
                message: message.trim()
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error("Apply error:", err);
            setError(err.message || "Failed to submit application.");
        } finally {
            setLoading(false);
        }
    };

    const modalContent = (
        <div className="modal-overlay" onClick={onClose} style={{ pointerEvents: 'auto' }}>
            <div className="modal-container" onClick={(e) => { e.stopPropagation(); }}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                {success ? (
                    <div className="success-state text-center py-4">
                        <div className="success-icon mb-3">✅</div>
                        <h2 className="handwriting text-accent">Application Sent!</h2>
                        <p>The project owner will review your request soon.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="mb-2">Apply to Build</h2>
                        <h3 className="project-title-preview mb-4 handwriting text-accent">{project.title}</h3>

                        {error && <div className="sketch-card error-card mb-4">{error}</div>}

                        <form onSubmit={handleSubmit} className="auth-form" onClick={(e) => e.stopPropagation()}>
                            <div className="form-group">
                                <label>Why do you want to join? (Optional cover letter)</label>
                                <textarea
                                    className="sketch-input sketch-textarea mb-4"
                                    placeholder="Explain how your skills can help this project..."
                                    rows="4"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="form-actions flex justify-end gap-3">
                                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Application ✨'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ApplyModal;
