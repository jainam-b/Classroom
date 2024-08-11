const express = require('express');
const { Timetable } = require('../models/timetable');
const { Classroom } = require('../models/classroom');
const { User } = require('../models/user');
const jwt = require('jsonwebtoken');
const router = express.Router();

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// Create Timetable route
router.post('/create', async (req, res) => {
    const { classroomId, subject, startTime, endTime, day } = req.body;
    const token = req.headers.authorization;

    if (!classroomId || !subject || !startTime || !endTime || !day) {
        return res.status(400).json({ message: 'Please provide classroom ID, subject, start time, end time, and day' });
    }

    if (!token) {
        return res.status(401).json({ message: 'JWT token is required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const currentUser = await User.findById(decoded.id);

        if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'principal')) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        const existingTimetables = await Timetable.find({
            classroom: classroomId,
            day,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ]
        });

        if (existingTimetables.length > 0) {
            return res.status(400).json({ message: 'Timetable period overlaps with existing periods' });
        }

        if (startTime < classroom.startTime || endTime > classroom.endTime) {
            return res.status(400).json({ message: 'Timetable period is outside classroom hours' });
        }

        const newTimetable = await Timetable.create({
            classroom: classroomId,
            subject,
            startTime,
            endTime,
            day
        });

        res.status(201).json({ message: 'Timetable created successfully', timetable: newTimetable });
    } catch (error) {
        console.error('Error creating timetable:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid JWT token' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update Timetable route
router.put('/:id', async (req, res) => {
    const { subject, startTime, endTime, day } = req.body;
    const token = req.headers.authorization;

    if (!subject || !startTime || !endTime || !day) {
        return res.status(400).json({ message: 'Please provide subject, start time, end time, and day' });
    }

    if (!token) {
        return res.status(401).json({ message: 'JWT token is required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const currentUser = await User.findById(decoded.id);

        if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'principal')) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const timetable = await Timetable.findById(req.params.id);
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }

        const classroom = await Classroom.findById(timetable.classroom);
        if (startTime < classroom.startTime || endTime > classroom.endTime) {
            return res.status(400).json({ message: 'Timetable period is outside classroom hours' });
        }

        const existingTimetables = await Timetable.find({
            classroom: timetable.classroom,
            day,
            _id: { $ne: req.params.id },
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ]
        });

        if (existingTimetables.length > 0) {
            return res.status(400).json({ message: 'Timetable period overlaps with existing periods' });
        }

        timetable.subject = subject;
        timetable.startTime = startTime;
        timetable.endTime = endTime;
        timetable.day = day;
        
        const updatedTimetable = await timetable.save();

        res.status(200).json({ message: 'Timetable updated successfully', timetable: updatedTimetable });
    } catch (error) {
        console.error('Error updating timetable:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid JWT token' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete Timetable route
router.delete('/:id', async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'JWT token is required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const currentUser = await User.findById(decoded.id);

        if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'principal')) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const deletedTimetable = await Timetable.findByIdAndDelete(req.params.id);
        if (!deletedTimetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }

        res.status(200).json({ message: 'Timetable deleted successfully' });
    } catch (error) {
        console.error('Error deleting timetable:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid JWT token' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get Timetable route
router.get('/:id', async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'JWT token is required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const currentUser = await User.findById(decoded.id);

        if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'principal')) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const timetable = await Timetable.findById(req.params.id).populate('classroom');
        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }

        res.status(200).json({ timetable });
    } catch (error) {
        console.error('Error fetching timetable:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid JWT token' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
