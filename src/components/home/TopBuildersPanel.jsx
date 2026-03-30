import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './HomeSidebar.css';

export default function TopBuildersPanel() {
    const { currentUser } = useAuth();

    // Hardcoded for now based on the image mockup
    const topBuilders = [
        { id: '1', name: 'Sarah J.', builds: 12 },
        { id: '2', name: 'Marcus C.', builds: 8 },
        { id: currentUser?.uid || '3', name: 'Adi (You)', builds: 5 }
    ];

    return (
        <div className="sketch-card top-builders-panel">
            <h3 className="panel-title handwriting">Top Builders</h3>

            <div className="builders-list mt-4">
                {topBuilders.map((builder, index) => (
                    <div key={builder.id} className="builder-row">
                        <span className="builder-rank">{index + 1}.</span>
                        <span className="builder-name">{builder.name}</span>
                        <span className="builder-count">
                            {builder.builds} Builds
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
