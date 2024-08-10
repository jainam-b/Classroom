const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startTime: { type: String, required: true }, // e.g., '12:00 PM'
    endTime: { type: String, required: true },   // e.g., '06:00 PM'
    days: { type: [String], required: true },    // e.g., ['Monday', 'Saturday']
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the teacher
});

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = { Classroom };
