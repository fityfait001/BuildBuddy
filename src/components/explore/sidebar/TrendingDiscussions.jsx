import React from 'react';
import { MessageCircle, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TrendingDiscussions() {
    const discussions = [
        { id: 1, title: "Best state management in React 2026?", comments: 42 },
        { id: 2, title: "How to perfectly center a div 🤡", comments: 128 },
        { id: 3, title: "Firebase vs Supabase for new projects", comments: 35 },
        { id: 4, title: "Feedback on my landing page design", comments: 19 },
    ];

    return (
        <div className="trending-discussions sketch-card mb-4">
            <h3 className="section-title handwriting text-danger">
                <Flame size={20} className="section-icon" /> Trending Discussions
            </h3>
            <div className="discussions-list mt-3">
                {discussions.map(disc => (
                    <div key={disc.id} className="discussion-item mb-3 pb-2 border-bottom">
                        <Link to="#" className="text-decoration-none text-dark fw-bold d-block mb-1">
                            {disc.title}
                        </Link>
                        <small className="text-muted d-flex align-items-center">
                            <MessageCircle size={14} className="me-1" /> {disc.comments} comments
                        </small>
                    </div>
                ))}
            </div>
        </div>
    );
}
