import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToComments, addComment } from '../../services/postService';
import { Send } from 'lucide-react';

export default function CommentPanel({ postId }) {
    const { currentUser, userProfile } = useAuth();
    
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToComments(postId, (realtimeComments) => {
            setComments(realtimeComments);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!newComment.trim()) return;
        
        setIsSubmitting(true);

        try {
            await addComment(postId, {
                authorId: currentUser.uid,
                authorName: userProfile?.displayName || currentUser.displayName || 'Anonymous',
                authorAvatar: userProfile?.photoURL || currentUser.photoURL || '',
                content: newComment.trim()
            });
            
            setNewComment('');
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="comment-panel mt-3 pt-3 border-top">
            
            {/* Comment List */}
            <div className="comments-list mb-3">
                {loading ? (
                    <div className="text-center small text-muted">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center small text-muted p-2">No comments yet. Be the first!</div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="comment-item d-flex mb-3">
                            <img 
                                src={comment.authorAvatar || `https://api.dicebear.com/7.x/micah/svg?seed=${comment.authorName}&backgroundColor=transparent`} 
                                alt={comment.authorName} 
                                className="avatar me-2" 
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div className="comment-content flex-grow-1 bg-light p-2 rounded sketch-card border-0">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="fw-bold small">{comment.authorName}</span>
                                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        {comment.createdAt?.toDate().toLocaleDateString() || 'Just now'}
                                    </span>
                                </div>
                                <p className="mb-0 small">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment */}
            <form onSubmit={handleSubmit} className="d-flex align-items-center mt-2">
                 <img 
                    src={`https://api.dicebear.com/7.x/micah/svg?seed=${userProfile?.displayName || currentUser?.displayName || 'User'}&backgroundColor=transparent`} 
                    alt="You" 
                    className="avatar me-2" 
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <input 
                    type="text" 
                    className="form-control sketch-input flex-grow-1 me-2" 
                    placeholder="Write a comment..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isSubmitting}
                />
                <button type="submit" className="btn btn-sm btn-primary" disabled={isSubmitting || !newComment.trim()}>
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
