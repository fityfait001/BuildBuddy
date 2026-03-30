import React, { useEffect, useState } from 'react';
import IdeaInputBar from './IdeaInputBar';
import ProjectRecruitmentCard from './ProjectRecruitmentCard';
import { getFeedProjects } from '../../services/projectService';

export default function HomeFeed({ searchQuery = "" }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadProjects() {
            try {
                const data = await getFeedProjects();
                setProjects(data);
            } catch (err) {
                setError("Failed to load feed. " + err.message);
            } finally {
                setLoading(false);
            }
        }

        loadProjects();
    }, []);

    return (
        <div className="home-feed-container">
            <IdeaInputBar />

            <div className="mt-4">
                {error && <div className="sketch-card error-card mb-4">{error}</div>}

                {loading ? (
                    <div className="loading-state sketch-card text-center py-5 mt-4">
                        <h3 className="handwriting">Loading awesome ideas...</h3>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="empty-state sketch-card text-center py-5 mt-4">
                        <h3>No active projects yet!</h3>
                        <p>Be the first to drop an idea above and start building.</p>
                    </div>
                ) : (
                    <div className="project-feed-list">
                        {projects.filter((project) => {
                            const query = searchQuery.toLowerCase();
                            return (
                                project.title?.toLowerCase().includes(query) ||
                                project.description?.toLowerCase().includes(query) ||
                                project.tags?.some(tag => tag.toLowerCase().includes(query))
                            );
                        }).map((project) => (
                            <ProjectRecruitmentCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
