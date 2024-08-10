const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
    slots: [{ day: String, period: String, subject: String }]
});

const Timetable = mongoose.model('Timetable', timetableSchema);
