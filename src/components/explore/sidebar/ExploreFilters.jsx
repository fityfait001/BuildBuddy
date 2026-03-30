import React from 'react';
import { Filter, HelpCircle, Activity, TrendingUp, MessageSquare } from 'lucide-react';

export default function ExploreFilters() {
    return (
        <div className="explore-filters sketch-card mb-4">
            <h3 className="section-title handwriting">
                <Filter size={20} className="section-icon" /> Filters
            </h3>
            <ul className="quick-access-list list-unstyled mt-3">
                <li className="quick-access-item">
                    <Filter size={18} />
                    <span>All Posts</span>
                </li>
                <li className="quick-access-item">
                    <HelpCircle size={18} />
                    <span>Help Requests</span>
                </li>
                <li className="quick-access-item">
                    <Activity size={18} />
                    <span>Project Updates</span>
                </li>
                <li className="quick-access-item">
                    <TrendingUp size={18} />
                    <span>Progress Updates</span>
                </li>
                <li className="quick-access-item">
                    <MessageSquare size={18} />
                    <span>Feedback</span>
                </li>
            </ul>
        </div>
    );
}
