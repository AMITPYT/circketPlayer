import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL

const PlayerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all players once for navigation and details
    useEffect(() => {
        const fetchAllPlayers = async () => {
            setLoading(true);
            try {
                // Fetch all players with full details
                const response = await axios.get(`${API_URL}/players/full`);
                setPlayers(response.data);
            } catch (error) {
                console.error('Error fetching all players:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllPlayers();
    }, []);

    const player = players.find(p => p._id === id);
    const currentIndex = players.findIndex(p => p._id === id);
    const playerIds = players.map(p => p._id);

    const goToNext = useCallback(() => {
        if (playerIds.length > 0 && currentIndex < playerIds.length - 1) {
            const nextId = playerIds[currentIndex + 1];
            navigate(`/player/${nextId}`);
        }
    }, [playerIds, currentIndex, navigate]);

    const goToPrevious = useCallback(() => {
        if (playerIds.length > 0 && currentIndex > 0) {
            const prevId = playerIds[currentIndex - 1];
            navigate(`/player/${prevId}`);
        }
    }, [playerIds, currentIndex, navigate]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                goToNext();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                goToPrevious();
            } else if (e.key === 'Escape') {
                navigate('/players');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNext, goToPrevious, navigate]);

    if (loading) {
        return (
            <div className="detail-loading">
                <div className="spinner"></div>
                <p>Loading player...</p>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="detail-empty">
                <h2>Player Not Found</h2>
                <button onClick={() => navigate('/players')}>Back to List</button>
            </div>
        );
    }

    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < playerIds.length - 1;

    return (
        <div className="detail-container">
            <div className="detail-header">
                <button onClick={() => navigate('/players')} className="back-btn">
                    ← Back to List
                </button>
                <div className="player-counter">
                    Player {currentIndex + 1} of {playerIds.length}
                </div>
                <div className="keyboard-hint">
                    Use ←→ arrow keys to navigate
                </div>
            </div>

            <div className="detail-main">
                <div className="nav-wrapper">
                    <button
                        onClick={goToPrevious}
                        className={`nav-btn prev-btn ${!hasPrevious ? 'disabled' : ''}`}
                        disabled={!hasPrevious}
                        aria-label="Previous player"
                    >
                        ‹
                    </button>
                    {!hasPrevious && <span className="nav-tooltip">No previous player</span>}
                </div>

                <div className="detail-card">
                    <div className="detail-image">
                        {player.profileImage ? (
                            <img src={player.profileImage} alt={player.name} />
                        ) : (
                            <div className="no-image-detail">🏏</div>
                        )}
                    </div>

                    <div className="detail-info">
                        <h1 className="player-name">{player.name}</h1>
                        <div className="role-badge-large">{player.role}</div>

                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-label">Age</span>
                                <span className="stat-value">{player.age}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Batting Style</span>
                                <span className="stat-value">{player.battingStyle}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Bowling Style</span>
                                <span className="stat-value">{player.bowlingStyle}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">WhatsApp Number</span>
                                <span className="stat-value">{player.whatsappNo || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="nav-wrapper">
                    <button
                        onClick={goToNext}
                        className={`nav-btn next-btn ${!hasNext ? 'disabled' : ''}`}
                        disabled={!hasNext}
                        aria-label="Next player"
                    >
                        ›
                    </button>
                    {!hasNext && <span className="nav-tooltip">No next player</span>}
                </div>
            </div>

            <div className="detail-progress">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${((currentIndex + 1) / playerIds.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default PlayerDetail;
