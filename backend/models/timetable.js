const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    subject: { type: String, required: true },
    startTime: { type: String, required: true }, // e.g., '01:00 PM'
    endTime: { type: String, required: true },   // e.g., '02:00 PM'
    day: { type: String, required: true }        // e.g., 'Monday'
});

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = { Timetable };
