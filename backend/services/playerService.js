const Player = require('../models/Player');
const { cloudinary } = require('../config/cloudinary');

class PlayerService {
    async createPlayer(playerData, resultFile) {
        if (resultFile) {
            playerData.profileImage = resultFile.path;
            playerData.cloudinaryId = resultFile.filename;
        }
        const player = new Player(playerData);
        return await player.save();
    }

    async getPlayers(query) {
        const { role, battingStyle, bowlingStyle, page = 1, limit = 12 } = query;
        const filter = {};

        if (role) filter.role = role;
        if (battingStyle) filter.battingStyle = battingStyle;
        if (bowlingStyle) filter.bowlingStyle = bowlingStyle;

        const players = await Player.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Player.countDocuments(filter);

        return {
            players,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalPlayers: count
        };
    }

    async getAllPlayerIds() {
        return await Player.find({}, '_id').sort({ createdAt: -1 });
    }

    async getPlayerById(id) {
        const player = await Player.findById(id);
        if (!player) {
            throw new Error('Player not found');
        }
        return player;
    }

    async updatePlayer(id, updateData, newFile) {
        const player = await Player.findById(id);
        if (!player) {
            throw new Error('Player not found');
        }

        if (newFile) {
            if (player.cloudinaryId) {
                await cloudinary.uploader.destroy(player.cloudinaryId);
            }
            updateData.profileImage = newFile.path;
            updateData.cloudinaryId = newFile.filename;
        }

        return await Player.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
    }

    async deletePlayer(id) {
        const player = await Player.findById(id);
        if (!player) {
            throw new Error('Player not found');
        }

        if (player.cloudinaryId) {
            await cloudinary.uploader.destroy(player.cloudinaryId);
        }

        return await Player.findByIdAndDelete(id);
    }
}

module.exports = new PlayerService();
