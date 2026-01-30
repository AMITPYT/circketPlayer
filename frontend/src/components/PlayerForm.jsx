import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL
const PlayerForm = () => {
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        role: '',
        battingStyle: '',
        bowlingStyle: '',
        profileImage: null
    });

    const roles = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'];
    const battingStyles = ['Right-hand batsman', 'Left-hand batsman'];
    const bowlingStyles = [
        'Right-arm fast',
        'Left-arm fast',
        'Right-arm medium',
        'Left-arm medium',
        'Right-arm off-spin',
        'Left-arm orthodox',
        'Right-arm leg-spin',
        'Left-arm chinaman',
        'None'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, profileImage: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('age', formData.age);
            data.append('role', formData.role);
            data.append('battingStyle', formData.battingStyle);
            data.append('bowlingStyle', formData.bowlingStyle);
            if (formData.profileImage) {
                data.append('profileImage', formData.profileImage);
            }

            await axios.post(`${API_URL}/players`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess(true);
            setFormData({
                name: '',
                age: '',
                role: '',
                battingStyle: '',
                bowlingStyle: '',
                profileImage: null
            });
            setImagePreview(null);
        } catch (error) {
            console.error('Error creating player:', error);
            alert('Failed to create player. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSuccess(false);
    };

    if (success) {
        return (
            <div className="form-container success-view">
                <div className="success-content">
                    <div className="success-icon">🎉</div>
                    <h1>Registration Successful!</h1>
                    <p>Your details have been added to the cricket team.</p>
                    <button onClick={handleReset} className="submit-btn">Add Another Player</button>
                    <p className="note">Admin will review your details.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="form-container">
            <h1 className="form-title">Player Registration</h1>
            <p className="form-subtitle">Enter your details to join the team auction</p>
            <form onSubmit={handleSubmit} className="player-form">
                <div className="form-group">
                    <label htmlFor="name">Player Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="age">Age</label>
                    <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Enter your age"
                        min="15"
                        max="50"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Your Role</option>
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="battingStyle">Batting Style</label>
                    <select
                        id="battingStyle"
                        name="battingStyle"
                        value={formData.battingStyle}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Batting Style</option>
                        {battingStyles.map(style => (
                            <option key={style} value={style}>{style}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="bowlingStyle">Bowling Style</label>
                    <select
                        id="bowlingStyle"
                        name="bowlingStyle"
                        value={formData.bowlingStyle}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Bowling Style</option>
                        {bowlingStyles.map(style => (
                            <option key={style} value={style}>{style}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="profileImage">Profile Image</label>
                    <input
                        type="file"
                        id="profileImage"
                        name="profileImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                    />
                    {imagePreview && (
                        <div className="image-preview">
                            <img src={imagePreview} alt="Preview" />
                        </div>
                    )}
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
            </form>
        </div>
    );
};

export default PlayerForm;
