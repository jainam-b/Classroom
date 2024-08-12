const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    days: { type: [String], required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    capacity: { type: Number, default: 30 },
    subject: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Add a pre-save hook to update the 'updatedAt' field
classroomSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = { Classroom };