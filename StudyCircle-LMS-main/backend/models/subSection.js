const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: Number,
        required: true,
        min: 0
    }
});

const subSectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    lectureType: {
        type: String,
        enum: ['video', 'reading', 'quiz'],
        default: 'video'
    },
    timeDuration: {
        type: String
    },
    description: {
        type: String
    },
    videoUrl: {
        type: String
    },
    // For reading lectures
    content: {
        type: String
    },
    externalLink: {
        type: String
    },
    // For quiz lectures
    questions: [questionSchema],
    totalQuestions: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('SubSection', subSectionSchema) 