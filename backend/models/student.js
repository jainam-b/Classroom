const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    username: String,
    password: String,
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
    assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' } // Reference to Teacher
});

const Student = mongoose.model('Student', studentSchema);

module.exports = { Student };
