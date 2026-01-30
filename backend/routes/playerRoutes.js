const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const playerController = require('../controllers/playerController');

// Create a new player
router.post('/', upload.single('profileImage'), playerController.createPlayer);

// Get all players with optional filters and pagination
router.get('/', playerController.getPlayers);

// Get all player IDs for navigation
router.get('/all', playerController.getAllPlayerIds);

// Get a single player by ID
router.get('/:id', playerController.getPlayerById);

// Update a player
router.put('/:id', upload.single('profileImage'), playerController.updatePlayer);

// Delete a player
router.delete('/:id', playerController.deletePlayer);

module.exports = router;
