const playerService = require('../services/playerService');

const createPlayer = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Profile image is required' });
        }

        const playerData = {
            name: req.body.name,
            age: req.body.age,
            role: req.body.role,
            battingStyle: req.body.battingStyle,
            bowlingStyle: req.body.bowlingStyle
        };
        const player = await playerService.createPlayer(playerData, req.file);
        res.status(201).json(player);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getPlayers = async (req, res) => {
    try {
        const result = await playerService.getPlayers(req.query);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllPlayerIds = async (req, res) => {
    try {
        const players = await playerService.getAllPlayerIds();
        res.json(players);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPlayerById = async (req, res) => {
    try {
        const player = await playerService.getPlayerById(req.params.id);
        res.json(player);
    } catch (error) {
        if (error.message === 'Player not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const updatePlayer = async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            age: req.body.age,
            role: req.body.role,
            battingStyle: req.body.battingStyle,
            bowlingStyle: req.body.bowlingStyle
        };

        // Filter out undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const updatedPlayer = await playerService.updatePlayer(req.params.id, updateData, req.file);
        res.json(updatedPlayer);
    } catch (error) {
        if (error.message === 'Player not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(400).json({ message: error.message });
    }
};

const deletePlayer = async (req, res) => {
    try {
        await playerService.deletePlayer(req.params.id);
        res.json({ message: 'Player deleted successfully' });
    } catch (error) {
        if (error.message === 'Player not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPlayer,
    getPlayers,
    getAllPlayerIds,
    getPlayerById,
    updatePlayer,
    deletePlayer
};
