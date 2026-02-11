import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL

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
            params.append('limit', 24);
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

    const downloadPDF = async () => {
        const toastId = toast.loading('Connecting to server...');
        try {
            const response = await axios.get(`${API_URL}/players/full`);
            const allPlayers = response.data;

            if (!allPlayers || allPlayers.length === 0) {
                toast.error('No player data found to download.', { id: toastId });
                return;
            }

            toast.loading(`Gathering ${allPlayers.length} player profiles...`, { id: toastId });

            const getBase64Image = (url) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.setAttribute('crossOrigin', 'anonymous');
                    img.onload = () => {
                        try {
                            const canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0);
                            resolve(canvas.toDataURL('image/jpeg', 0.8));
                        } catch (e) {
                            console.error('Canvas processing error:', e);
                            resolve(null);
                        }
                    };
                    img.onerror = () => resolve(null);
                    // Add timestamp to avoid CORS issues with cached images without CORS headers
                    const urlWithTimestamp = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
                    img.src = urlWithTimestamp;
                });
            };

            // Fetch all images in parallel for better performance
            const imagePromises = allPlayers.map(player =>
                player.profileImage ? getBase64Image(player.profileImage) : Promise.resolve(null)
            );

            const playerImages = await Promise.all(imagePromises);

            toast.loading('Generating professional PDF catalog...', { id: toastId });

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            for (let i = 0; i < allPlayers.length; i++) {
                const player = allPlayers[i];
                const imgData = playerImages[i];

                if (i > 0) doc.addPage();

                // Design: Dark Header
                doc.setFillColor(15, 23, 42); // bg-dark
                doc.rect(0, 0, 210, 50, 'F');

                // Accent Line
                doc.setFillColor(99, 102, 241); // primary
                doc.rect(0, 50, 210, 2, 'F');

                // Header Text
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(24);
                doc.setFont('helvetica', 'bold');
                doc.text('PLAYER PROFILE', 105, 30, { align: 'center' });

                // Profile Image Container
                if (imgData) {
                    const frameSize = 70;
                    const xPos = 105 - (frameSize / 2);
                    const yPos = 65;

                    // Main Frame
                    doc.setDrawColor(99, 102, 241);
                    doc.setLineWidth(0.5);
                    doc.roundedRect(xPos, yPos, frameSize, frameSize, 2, 2, 'D');

                    // Background for image area
                    doc.setFillColor(248, 250, 252);
                    doc.rect(xPos + 1, yPos + 1, frameSize - 2, frameSize - 2, 'F');

                    try {
                        doc.addImage(imgData, 'JPEG', xPos + 2, yPos + 2, frameSize - 4, frameSize - 4, undefined, 'FAST');
                    } catch (e) {
                        console.error('Error adding image to PDF', e);
                    }
                }



                // Player Name
                doc.setTextColor(15, 23, 42);
                doc.setFontSize(36);
                doc.setFont('helvetica', 'bold');
                doc.text(player.name.toUpperCase(), 105, 165, { align: 'center' });

                // Role Badge
                const roleWidth = doc.getTextWidth(player.role) + 20;
                doc.setFillColor(99, 102, 241);
                doc.roundedRect((210 - roleWidth) / 2, 172, roleWidth, 12, 6, 6, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(14);
                doc.text(player.role, 105, 180, { align: 'center' });

                // Stats Section
                const startX = 40;
                const startY = 210;
                const stats = [
                    { label: 'AGE', value: String(player.age) + ' Years' },
                    { label: 'WHATSAPP', value: player.whatsappNo ? String(player.whatsappNo) : 'N/A' },
                    { label: 'BATTING', value: String(player.battingStyle) },
                    { label: 'BOWLING', value: String(player.bowlingStyle) }
                ];

                stats.forEach((stat, idx) => {
                    const y = startY + (idx * 18);
                    doc.setTextColor(100, 116, 139);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.text(stat.label, startX, y);

                    doc.setTextColor(15, 23, 42);
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.text(stat.value, startX, y + 8);

                    // Underline
                    doc.setDrawColor(241, 245, 249);
                    doc.line(startX, y + 11, 170, y + 11);
                });

                // Footer
                doc.setFontSize(9);
                doc.setTextColor(148, 163, 184);
                doc.text('Cricket Team Management System', 14, 285);
                doc.text(`Page ${i + 1} of ${allPlayers.length}`, 196, 285, { align: 'right' });
            }

            doc.save(`Cricket_Team_Players_${new Date().getTime()}.pdf`);
            toast.success('Professional Catalog Downloaded!', { id: toastId });
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate professional PDF.', { id: toastId });
        }
    };

    return (
        <div className="list-container">
            <div className="list-header">
                <h1>Player List</h1>
                <div className="header-actions">
                    <button onClick={downloadPDF} className="download-btn">
                        📄 Download Report
                    </button>
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
