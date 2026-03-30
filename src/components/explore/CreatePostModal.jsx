import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createPost } from '../../services/postService';
import { Send, Tag, X } from 'lucide-react';

export default function CreatePostModal({ isOpen, onClose }) {
    const { currentUser, userProfile } = useAuth();
    
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState('Update');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const postTypes = ['Update', 'Help', 'Progress', 'Feedback'];

    const textareaRef = useRef(null);

    // Auto-resizing textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset to calculate real height
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 80), 300)}px`;
        }
    }, [content]);

    // Word Count Calculation
    const getWordCount = (text) => {
        return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    };
    const currentWordCount = getWordCount(content);

    const handleContentChange = (e) => {
        const newValue = e.target.value;
        const newWordCount = getWordCount(newValue);
        
        // Allow input if we are under the limit, OR if deleting words completely
        if (newWordCount <= 200 || newValue.length < content.length) {
            setContent(newValue);
        }
    };

    if (!isOpen) return null;

    const handleAddTag = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!content.trim()) {
            setError("Post content is required.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await createPost({
                authorId: currentUser.uid,
                authorName: userProfile?.displayName || currentUser.displayName || 'Anonymous',
                authorUsername: userProfile?.username || '',
                authorAvatar: userProfile?.photoURL || currentUser.photoURL || '',
                postType,
                title,
                content,
                tags
            });
            
            // Reset form
            setContent('');
            setTags([]);
            setPostType('Update');
            
            onClose(); // Close modal on success
            
        } catch (err) {
            console.error(err);
            setError("Failed to create post. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop" style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' 
        }}>
            <div className="modal-dialog m-0 w-100" style={{ maxWidth: '600px' }}>
                <div className="modal-content sketch-card p-4" style={{ backgroundColor: 'var(--bg-color)', border: '3px solid var(--primary-color)' }}>
                    
                    {/* Header */}
                    <div className="modal-header border-0 p-0 mb-3 d-flex justify-content-between align-items-center">
                        <h4 className="modal-title handwriting mb-0">Create Post</h4>
                        <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="modal-body p-0">
                        {/* User Information Section */}
                        <div className="d-flex align-items-center mb-4">
                            <img 
                                src={`https://api.dicebear.com/7.x/micah/svg?seed=${userProfile?.displayName || currentUser?.displayName || 'User'}&backgroundColor=transparent`} 
                                alt="User" 
                                className="avatar me-3 bg-white" 
                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                                <div className="fw-bold lh-sm">{userProfile?.displayName || currentUser?.displayName || 'User'}</div>
                                <div className="text-muted small lh-sm">Posting to Community</div>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                            {/* POST CONTENT SECTION */}
                            <div className="d-flex flex-column gap-1 mb-3">
                                <textarea 
                                    ref={textareaRef}
                                    autoFocus
                                    className="form-control sketch-input bg-white w-100 border-0 p-2" 
                                    placeholder="Share an update, ask a question, or show your progress..."
                                    value={content}
                                    onChange={handleContentChange}
                                    style={{ 
                                        fontSize: '1.05rem', 
                                        resize: 'none', 
                                        boxShadow: 'none',
                                        minHeight: '80px',
                                        maxHeight: '300px',
                                        overflowY: 'auto'
                                    }}
                                    required
                                />
                                <div className={`text-end small ${currentWordCount >= 200 ? 'text-danger fw-bold' : 'text-muted'}`}>
                                    {currentWordCount} / 200 words
                                </div>
                            </div>
                            
                            {/* TAGS SECTION */}
                            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                                {tags.map((tag, index) => (
                                    <span key={index} className="tech-badge bg-light py-1 px-3 rounded-pill pointer border" onClick={() => removeTag(tag)}>
                                        #{tag} &times;
                                    </span>
                                ))}
                                <input 
                                    type="text" 
                                    className="border-0 bg-transparent" 
                                    placeholder={tags.length === 0 ? "Add tags... (press Enter)" : "Add tag..."}
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    style={{ outline: 'none', minWidth: '120px', padding: '4px 8px' }}
                                />
                            </div>

                            {/* POST TYPE SELECTOR */}
                            <div className="post-type-selector d-flex gap-2 w-100 border rounded p-1 bg-light mb-3">
                                {postTypes.map(type => (
                                    <button 
                                        type="button" 
                                        key={type} 
                                        className={`btn flex-fill ${postType === type ? 'btn-primary' : 'btn-light'}`}
                                        style={{ transition: 'all 0.2s', borderRadius: '4px', border: 'none' }}
                                        onClick={() => setPostType(type)}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {/* FOOTER ACTIONS */}
                            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                <button 
                                    type="button" 
                                    className="btn btn-outline-dark sketch-button px-4"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary d-flex align-items-center px-4"
                                    disabled={isSubmitting}
                                >
                                    <Send size={16} className="me-2" /> 
                                    {isSubmitting ? 'Posting...' : 'POST'}
                                </button>
                            </div>
                            {error && <div className="text-danger mt-2 small">{error}</div>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
