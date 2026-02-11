import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL

const AuctionView = () => {
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch all players on mount
    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            // Using the /full endpoint which returns all players
            const response = await axios.get(`${API_URL}/players/full`);
            setPlayers(response.data);
        } catch (error) {
            console.error('Error fetching players:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentPlayer = players[currentIndex];

    const goToNext = useCallback(() => {
        if (players.length > 0) {
            setCurrentIndex(prev => (prev + 1) % players.length);
        }
    }, [players.length]);

    const goToPrevious = useCallback(() => {
        if (players.length > 0) {
            setCurrentIndex(prev => (prev - 1 + players.length) % players.length);
        }
    }, [players.length]);

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
            <div className="auction-loading">
                <div className="spinner"></div>
                <p>Loading players...</p>
            </div>
        );
    }

    if (players.length === 0 && !loading) {
        return (
            <div className="auction-empty">
                <h2>No Players Available</h2>
                <p>Add some players to start the auction</p>
                <button onClick={() => navigate('/add')}>Add Player</button>
            </div>
        );
    }

    if (!currentPlayer) return <div className="auction-loading">Loading...</div>;

    return (
        <div className="auction-container">
            <div className="auction-header">
                <button onClick={() => navigate('/players')} className="back-btn">
                    ← Back to List
                </button>
                <div className="player-counter">
                    Player {currentIndex + 1} of {players.length}
                </div>
                <div className="keyboard-hint">
                    Use ←→ or ↑↓ arrow keys to navigate
                </div>
            </div>

            <div className="auction-main">
                <button
                    onClick={goToPrevious}
                    className="nav-btn prev-btn"
                    aria-label="Previous player"
                >
                    ‹
                </button>

                <div className="auction-card">
                    <div className="auction-image">
                        {currentPlayer.profileImage ? (
                            <img src={currentPlayer.profileImage} alt={currentPlayer.name} />
                        ) : (
                            <div className="no-image-auction">🏏</div>
                        )}
                    </div>

                    <div className="auction-info">
                        <h1 className="player-name">{currentPlayer.name}</h1>
                        <div className="role-badge-large">{currentPlayer.role}</div>

                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-label">Age</span>
                                <span className="stat-value">{currentPlayer.age}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Batting Style</span>
                                <span className="stat-value">{currentPlayer.battingStyle}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Bowling Style</span>
                                <span className="stat-value">{currentPlayer.bowlingStyle}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={goToNext}
                    className="nav-btn next-btn"
                    aria-label="Next player"
                >
                    ›
                </button>
            </div>

            <div className="auction-progress">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${((currentIndex + 1) / players.length) * 100}%` }}
                    ></div>
                </div>
                <div className="progress-dots">
                    {players.map((_, index) => (
                        <button
                            key={index}
                            className={`progress-dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Go to player ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuctionView;
