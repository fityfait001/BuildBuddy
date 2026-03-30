import React from 'react';
import AppNavbar from '../components/layout/AppNavbar';
import './Explore.css';

// Sidebar Components
import ExploreFilters from '../components/explore/sidebar/ExploreFilters';
import TrendingTags from '../components/explore/sidebar/TrendingTags';
import TrendingDiscussions from '../components/explore/sidebar/TrendingDiscussions';

// Main Feed Components
import PostFeed from '../components/explore/PostFeed';

export default function Explore() {
    return (
        <div className="explore-page">
            <AppNavbar />
            
            <div className="explore-container explore-grid mt-4">
                
                {/* Left Column: Filters and Tags */}
                <aside className="home-left-col">
                    <ExploreFilters />
                    <TrendingTags />
                </aside>

                {/* Main Column: Feed and Create Post */}
                <main className="explore-main-col">
                    <PostFeed />
                </main>

                {/* Right Column: Community Highlights */}
                <aside className="home-right-col hide-mobile">
                    <TrendingDiscussions />
                </aside>
                
            </div>
        </div>
    );
}

