import React, { useState, useEffect } from 'react';
import { Hash } from 'lucide-react';
import { subscribeToPosts } from '../../../services/postService';

export default function TrendingTags() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToPosts((posts) => {
            // Count frequency of all tags across posts
            const tagCounts = {};
            posts.forEach(post => {
                if (post.tags && Array.isArray(post.tags)) {
                    post.tags.forEach(tag => {
                        const lowerTag = tag.trim().toLowerCase();
                        if (lowerTag) {
                            tagCounts[lowerTag] = (tagCounts[lowerTag] || 0) + 1;
                        }
                    });
                }
            });

            // Sort by frequency and take top 5-10
            const sortedTags = Object.keys(tagCounts)
                .sort((a, b) => tagCounts[b] - tagCounts[a])
                .slice(0, 8); // Showing top 8 trending tags

            // Provide fallback if no tags exist
            if (sortedTags.length === 0) {
                setTags(['AI', 'Web3', 'React', 'BuildBuddy']);
            } else {
                setTags(sortedTags);
            }
            
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="trending-tags sketch-card">
            <h3 className="section-title handwriting">
                <Hash size={20} className="section-icon" /> Trending Tags
            </h3>
            <div className="d-flex flex-wrap gap-2 mt-3 p-1">
                {loading ? (
                    <span className="text-muted small px-2">Loading trends...</span>
                ) : tags.map((tag, index) => (
                    <span 
                        key={index} 
                        className="badge rounded-pill explore-hover"
                        style={{ 
                            display: 'inline-block',
                            padding: '6px 12px',
                            border: '1px solid #dcdcdc',
                            backgroundColor: '#f8f8f8',
                            color: '#212529',
                            fontSize: '0.85rem',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            marginBottom: '4px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8f8f8';
                            e.currentTarget.style.color = '#212529';
                        }}
                    >
                        #{tag}
                    </span>
                ))}
            </div>
        </div>
    );
}
