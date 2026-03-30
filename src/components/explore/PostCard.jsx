import React, { useState } from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import CommentPanel from './CommentPanel';

export default function PostCard({ post }) {
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);

    // Dynamic Badge Color
    const getBadgeClass = (type) => {
        switch (type) {
            case 'Help': return 'bg-danger';
            case 'Success':
            case 'Progress': return 'bg-success';
            case 'Feedback': return 'bg-warning text-dark';
            default: return 'bg-primary';
        }
    };

    return (
        <div className="post-card sketch-card mb-4" style={{ backgroundColor: 'white' }}>
            {/* Header */}
            <div className="post-header d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                    <img 
                        src={post.authorAvatar || `https://api.dicebear.com/7.x/micah/svg?seed=${post.authorName}&backgroundColor=transparent`} 
                        alt={post.authorName} 
                        className="avatar me-3 border border-dark rounded-circle" 
                        style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                    />
                    <div>
                        <h6 className="mb-0 fw-bold">{post.authorName}</h6>
                        <small className="text-muted d-flex align-items-center">
                            <Clock size={12} className="me-1" /> 
                            {post.createdAt ? post.createdAt.toDate().toLocaleString() : 'Just now'}
                        </small>
                    </div>
                </div>
                <span className={`badge ${getBadgeClass(post.postType)} rounded-pill px-3 py-2`}>
                    {post.postType}
                </span>
            </div>

            {/* Body */}
            <div className="post-body">
                <h5 className="fw-bold mb-2">{post.title}</h5>
                <p className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
                
                {post.tags && post.tags.length > 0 && (
                    <div className="post-tags d-flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag, i) => (
                            <span key={i} className="tech-badge bg-light text-dark">#{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div 
                className="post-footer mt-3 pt-3 border-top d-flex justify-content-between align-items-center pointer" 
                onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                style={{ cursor: 'pointer' }}
            >
                <div className="d-flex align-items-center text-muted fw-bold">
                    <MessageSquare size={18} className="me-2" /> 
                    {post.commentsCount || 0} Comments
                </div>
                <div className="text-primary fw-bold">
                    {isCommentsOpen ? 'Close Discussion' : 'View Discussion'}
                </div>
            </div>

            {/* Comment Panel Toggle */}
            {isCommentsOpen && (
                <div onClick={e => e.stopPropagation()}>
                    <CommentPanel postId={post.id} />
                </div>
            )}
        </div>
    );
}
