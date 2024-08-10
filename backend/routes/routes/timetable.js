const express = require('express');
const { Timetable } = require('../../models/timetable');
const { Classroom } = require('../../models/classroom');
const { User } = require('../../models/user'); // Ensure User model is imported
const jwt = require('jsonwebtoken');
const router = express.Router();

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// Create Timetable route
router.post('/create', async (req, res) => {
    const { classroomId, subject, startTime, endTime, day } = req.body;
    const token = req.headers.authorization ; // Extract token from "Bearer <token>"

    if (!classroomId || !subject || !startTime || !endTime || !day) {
        return res.status(400).json({ message: 'Please provide classroom ID, subject, start time, end time, and day' });
    }

    if (!token) {
        return res.status(401).json({ message: 'JWT token is required' });
    }

    try {
        // Verify the token and role of the user making the request
        const decoded = jwt.verify(token, JWT_SECRET);
        const currentUser = await User.findById(decoded.id);

        if (!currentUser || currentUser.role !== 'teacher' ) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Find the classroom
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Check if the timetable period overlaps with existing periods or is outside classroom hours
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

        // Create new timetable
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

module.exports = router;
