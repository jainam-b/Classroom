const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    username: String,
    password: String,
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
     
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = { Teacher };
