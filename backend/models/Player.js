const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Player name is required'],
        trim: true
    },
    age: {
        type: Number,
        required: [true, 'Player age is required'],
        min: [15, 'Age must be at least 15'],
        max: [50, 'Age cannot exceed 50']
    },
    role: {
        type: String,
        required: [true, 'Player role is required'],
        enum: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper']
    },
    battingStyle: {
        type: String,
        required: [true, 'Batting style is required'],
        enum: ['Right-hand batsman', 'Left-hand batsman']
    },
    bowlingStyle: {
        type: String,
        required: [true, 'Bowling style is required'],
        enum: [
            'Right-arm fast',
            'Left-arm fast',
            'Right-arm medium',
            'Left-arm medium',
            'Right-arm off-spin',
            'Left-arm orthodox',
            'Right-arm leg-spin',
            'Left-arm chinaman',
            'None'
        ]
    },
    profileImage: {
        type: String,
        default: ''
    },
    cloudinaryId: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Player', playerSchema);
