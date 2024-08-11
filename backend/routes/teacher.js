
const express = require('express');
const { Timetable } = require('../models/timetable');
const { Classroom } = require('../models/classroom');
const { User } = require('../models/user'); // Ensure User model is imported
const jwt = require('jsonwebtoken');
const router = express.Router();
const authenticate = require("../middleware/authMiddleware")
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;


// Get List of Students in the Teacher's Classroom
router.get('/teacher/students', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const classroom = await Classroom.findOne({ teacher: req.user._id });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        const students = await User.find({ role: 'student', classroom: classroom._id });
        res.status(200).json({ students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update Student Details
router.put('/teacher/students/:id', authenticate, async (req, res) => {
    const { username } = req.body;
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const classroom = await Classroom.findOne({ teacher: req.user._id });
        const updatedStudent = await User.findOneAndUpdate(
            { _id: req.params.id, classroom: classroom._id },
            { username },
            { new: true }
        );
        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: 'Student updated successfully', student: updatedStudent });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete Student
router.delete('/teacher/students/:id', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const classroom = await Classroom.findOne({ teacher: req.user._id });
        const deletedStudent = await User.findOneAndDelete({ _id: req.params.id, classroom: classroom._id });
        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create Timetable for Classroom
router.post('/teacher/timetables', authenticate, async (req, res) => {
    const { subject, startTime, endTime, day } = req.body;
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const classroom = await Classroom.findOne({ teacher: req.user._id });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        if (startTime < classroom.startTime || endTime > classroom.endTime) {
            return res.status(400).json({ message: 'Timetable period is outside classroom hours' });
        }

        const existingTimetables = await Timetable.find({
            classroom: classroom._id,
            day,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ]
        });

        if (existingTimetables.length > 0) {
            return res.status(400).json({ message: 'Timetable period overlaps with existing periods' });
        }

        const newTimetable = await Timetable.create({
            classroom: classroom._id,
            subject,
            startTime,
            endTime,
            day
        });

        res.status(201).json({ message: 'Timetable created successfully', timetable: newTimetable });
    } catch (error) {
        console.error('Error creating timetable:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
