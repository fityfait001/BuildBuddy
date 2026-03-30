import React, { useState } from 'react';
import AppNavbar from '../components/layout/AppNavbar';
import QuickAccessPanel from '../components/home/QuickAccessPanel';
import YourStackPanel from '../components/home/YourStackPanel';
import TopBuildersPanel from '../components/home/TopBuildersPanel';
import TrendingTechPanel from '../components/home/TrendingTechPanel';
import HomeFeed from '../components/home/HomeFeed';
import './Home.css';

export default function Home() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="home-page">
            <AppNavbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <div className="container home-grid">

                {/* Left Column: Quick Access & Your Stack */}
                <aside className="home-left-col">
                    <QuickAccessPanel />
                    <YourStackPanel />
                </aside>

                {/* Main Column: Idea Input & Project Feed */}
                <main className="home-main-col">
                    <HomeFeed searchQuery={searchQuery} />
                </main>

                {/* Right Column: Top Builders & Trending Tech */}
                <aside className="home-right-col">
                    <TopBuildersPanel />
                    <TrendingTechPanel />
                </aside>

            </div>
        </div>
    );
}
