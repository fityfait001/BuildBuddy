import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserById, updateUserProfile } from '../services/userService';
import AppNavbar from '../components/layout/AppNavbar';
import './CreateProfile.css';

export default function Settings() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        displayName: '',
        university: '',
        branch: '',
        degree: '',
        year: '',
        github: '',
        linkedin: '',
        portfolio: '',
        skills: '',
        bio: ''
    });

    useEffect(() => {
        async function loadUserData() {
            if (!currentUser) return;
            try {
                const userData = await getUserById(currentUser.uid);
                setFormData({
                    displayName: userData.displayName || '',
                    university: userData.university || '',
                    branch: userData.branch || '',
                    degree: userData.degree || '',
                    year: userData.year || '',
                    github: userData.github || '',
                    linkedin: userData.linkedin || '',
                    portfolio: userData.portfolio || '',
                    skills: userData.skills ? userData.skills.join(', ') : '',
                    bio: userData.bio || ''
                });
            } catch (err) {
                setError("Failed to load your profile details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadUserData();
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!formData.github.startsWith('https://github.com/')) {
            return setError("GitHub link must start with https://github.com/");
        }
        if (formData.linkedin && !formData.linkedin.startsWith('https://linkedin.com/')) {
            return setError("LinkedIn link must start with https://linkedin.com/");
        }

        // Process skills
        const skillsArray = formData.skills
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== '');

        if (skillsArray.length === 0) {
            return setError("Please provide at least one skill.");
        }

        setSaving(true);

        try {
            const profilePayload = {
                displayName: formData.displayName,
                university: formData.university,
                branch: formData.branch,
                degree: formData.degree,
                year: formData.year,
                github: formData.github,
                linkedin: formData.linkedin,
                portfolio: formData.portfolio,
                bio: formData.bio,
                skills: skillsArray
            };

            await updateUserProfile(currentUser.uid, profilePayload);
            setSuccess("Profile updated successfully!");
            
            // Redirect back to profile after a short delay
            setTimeout(() => {
                navigate(`/profile/${currentUser.uid}`);
            }, 1000);

        } catch (err) {
            setError("Failed to save profile changes. " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="create-profile-page">
                <AppNavbar />
                <div className="container mt-4 text-center">
                    <h2 className="handwriting">Loading settings...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="create-profile-page">
            <AppNavbar />
            <div className="container mt-4 mb-5">
                <div className="sketch-card profile-form-card mx-auto">
                    <div className="text-center mb-4">
                        <h2 className="handwriting text-3xl">Edit Profile</h2>
                        <p className="text-muted mt-2">Update your information so others know what you are building.</p>
                    </div>

                    {error && <div className="sketch-card error-card mb-4">{error}</div>}
                    {success && <div className="sketch-card bg-neon mb-4"><strong>Success:</strong> {success}</div>}

                    <form onSubmit={handleSubmit} className="profile-form">
                        {/* Basic Identity */}
                        <h3 className="section-label">Basic Identity</h3>
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="displayName"
                                className="sketch-input"
                                value={formData.displayName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Academic Information */}
                        <h3 className="section-label mt-4">Academic Information</h3>
                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label>University / College *</label>
                                <input
                                    type="text"
                                    name="university"
                                    className="sketch-input"
                                    value={formData.university}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label>Branch / Major *</label>
                                <input
                                    type="text"
                                    name="branch"
                                    className="sketch-input"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label>Degree *</label>
                                <input
                                    type="text"
                                    name="degree"
                                    className="sketch-input"
                                    placeholder="e.g. B.Tech, B.S."
                                    value={formData.degree}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label>Year of Study *</label>
                                <select
                                    name="year"
                                    className="sketch-input"
                                    value={formData.year}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled>Select Year</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                    <option value="Graduate">Graduate</option>
                                    <option value="Alumni">Alumni</option>
                                </select>
                            </div>
                        </div>

                        {/* Developer Profiles */}
                        <h3 className="section-label mt-4">Developer Profiles</h3>
                        <div className="form-group">
                            <label>GitHub Profile Link *</label>
                            <input
                                type="url"
                                name="github"
                                className="sketch-input"
                                placeholder="https://github.com/username"
                                value={formData.github}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label>LinkedIn Profile Link</label>
                                <input
                                    type="url"
                                    name="linkedin"
                                    className="sketch-input"
                                    placeholder="https://linkedin.com/in/username"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label>Portfolio Website</label>
                                <input
                                    type="url"
                                    name="portfolio"
                                    className="sketch-input"
                                    placeholder="https://mywebsite.com"
                                    value={formData.portfolio}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Skills & Bio */}
                        <h3 className="section-label mt-4">Skills & About</h3>
                        <div className="form-group">
                            <label>Skills * <span className="text-muted font-normal text-sm">(Comma separated)</span></label>
                            <input
                                type="text"
                                name="skills"
                                className="sketch-input"
                                placeholder="React, Node.js, Machine Learning"
                                value={formData.skills}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Short Bio</label>
                            <textarea
                                name="bio"
                                className="sketch-input"
                                rows="3"
                                maxLength="200"
                                placeholder="Tell us a bit about what you love building..."
                                value={formData.bio}
                                onChange={handleChange}
                            />
                            <div className="text-right text-muted text-sm mt-1">
                                {formData.bio.length}/200
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button type="button" onClick={() => navigate(-1)} className="btn sketch-btn w-100 bg-white">
                                Cancel
                            </button>
                            <button disabled={saving} type="submit" className="btn btn-primary w-100">
                                {saving ? 'Saving Changes...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
