import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PlayerList = () => {
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        role: '',
        battingStyle: '',
        bowlingStyle: ''
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

    useEffect(() => {
        fetchPlayers();
    }, [filters, page]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [filters]);

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', 12);
            if (filters.role) params.append('role', filters.role);
            if (filters.battingStyle) params.append('battingStyle', filters.battingStyle);
            if (filters.bowlingStyle) params.append('bowlingStyle', filters.bowlingStyle);

            const response = await axios.get(`${API_URL}/players?${params.toString()}`);
            setPlayers(response.data.players);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching players:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            role: '',
            battingStyle: '',
            bowlingStyle: ''
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this player?')) {
            try {
                await axios.delete(`${API_URL}/players/${id}`);
                fetchPlayers();
            } catch (error) {
                console.error('Error deleting player:', error);
            }
        }
    };

    return (
        <div className="list-container">
            <div className="list-header">
                <h1>Player List</h1>
                <div className="header-actions">
                    <button onClick={() => navigate('/auction')} className="auction-btn">
                        🏏 Start Auction
                    </button>
                    <button onClick={() => navigate('/add')} className="add-btn">
                        + Add Player
                    </button>
                </div>
            </div>

            <div className="filters">
                <div className="filter-group">
                    <label>Role</label>
                    <select name="role" value={filters.role} onChange={handleFilterChange}>
                        <option value="">All Roles</option>
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Batting Style</label>
                    <select name="battingStyle" value={filters.battingStyle} onChange={handleFilterChange}>
                        <option value="">All Styles</option>
                        {battingStyles.map(style => (
                            <option key={style} value={style}>{style}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Bowling Style</label>
                    <select name="bowlingStyle" value={filters.bowlingStyle} onChange={handleFilterChange}>
                        <option value="">All Styles</option>
                        {bowlingStyles.map(style => (
                            <option key={style} value={style}>{style}</option>
                        ))}
                    </select>
                </div>

                <button onClick={clearFilters} className="clear-btn">Clear Filters</button>
            </div>

            {loading ? (
                <div className="loading">Loading players...</div>
            ) : players.length === 0 ? (
                <div className="no-players">
                    <p>No players found.</p>
                    <button onClick={() => navigate('/add')}>Add your first player</button>
                </div>
            ) : (
                <>
                    <div className="players-grid">
                        {players.map(player => (
                            <div key={player._id} className="player-card" onClick={() => navigate(`/player/${player._id}`)} style={{ cursor: 'pointer' }}>
                                <div className="player-image">
                                    {player.profileImage ? (
                                        <img src={player.profileImage} alt={player.name} />
                                    ) : (
                                        <div className="no-image">🏏</div>
                                    )}
                                </div>
                                <div className="player-info">
                                    <h3>{player.name}</h3>
                                    <p className="role-badge">{player.role}</p>
                                    <div className="player-details">
                                        <span>Age: {player.age}</span>
                                        <span>{player.battingStyle}</span>
                                        <span>{player.bowlingStyle}</span>
                                    </div>
                                </div>
                                <div className="player-actions">
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(player._id); }} className="delete-btn">
                                        Delete
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); navigate(`/player/${player._id}`); }} className="view-btn">
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="page-btn"
                            >
                                Previous
                            </button>
                            <span className="page-info">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="page-btn"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PlayerList;
