import React, { useEffect, useState } from 'react';
import { subscribeToPosts } from '../../services/postService';
import PostCard from './PostCard';
import CreatePostBox from './CreatePostBox';

export default function PostFeed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToPosts((realtimePosts) => {
            setPosts(realtimePosts);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return (
        <div className="post-feed-container">
            <CreatePostBox />
            
            <div className="mt-4">
                {loading ? (
                    <div className="text-center sketch-card py-5">
                        <h4 className="handwriting text-muted">Loading posts...</h4>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center sketch-card py-5">
                        <h4 className="handwriting text-muted mb-2">It's quiet in here...</h4>
                        <p>Be the first to share an update or start a discussion!</p>
                    </div>
                ) : (
                    <div className="posts-list">
                        {posts.map(post => <PostCard key={post.id} post={post} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
