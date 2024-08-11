const mongoose = require('mongoose');

// Create a Schema for Users
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student' },
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Classroom",
      },
});

// Create a model from the schema
const User = mongoose.model('User', userSchema);

module.exports = { User };
