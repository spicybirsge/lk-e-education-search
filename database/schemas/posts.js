const mongoose = require('mongoose');
const Posts = mongoose.Schema({
    ID: String,
    createdAt: Number,
    grade: Number,
    subject: String,
    youtube_id: String
})

module.exports = mongoose.model('posts', Posts);