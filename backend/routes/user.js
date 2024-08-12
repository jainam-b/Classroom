const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const router = express.Router();
require('dotenv').config();
const authenticate = require("../middleware/authMiddleware");
const JWT_SECRET = process.env.JWT_SECRET;

// Role constants
const ROLES = {
    PRINCIPAL: 'principal',
    TEACHER: 'teacher',
    STUDENT: 'student',
};

// Signup route
router.post('/signup', authenticate, async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Please provide username, password, and role' });
    }

    try {
        // Get the current user from the request
        const currentUser = await User.findById(req.user.id);

        if (!currentUser) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check if the current user is allowed to create accounts
        if (
            (currentUser.role === ROLES.PRINCIPAL && (role === ROLES.TEACHER || role === ROLES.STUDENT)) ||
            (currentUser.role === ROLES.TEACHER && role === ROLES.STUDENT)
        ) {
            // Check if user already exists
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Create new user
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({ username, password: hashedPassword, role });

            // Generate JWT token for the new user
            const newToken = jwt.sign(
                { id: newUser._id, role: newUser.role },
                JWT_SECRET,
                
            );

            return res.status(201).json({ message: 'User created successfully', token: newToken });
        } else {
            return res.status(403).json({ message: 'Forbidden' });
        }
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
    }

    try {
        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
             
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user (Principal only)
router.put('/:id', authenticate, async (req, res) => {
    if (req.user.role !== ROLES.PRINCIPAL) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete user (Principal only)
router.delete('/:id', authenticate, async (req, res) => {
    if (req.user.role !== ROLES.PRINCIPAL) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Principal only route to get lists of teachers and students
router.get('/users', authenticate, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser || currentUser.role !== 'principal') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const teachers = await User.find({ role: 'teacher' });
        const students = await User.find({ role: 'student' });

        res.status(200).json({ teachers, students });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
module.exports = router;
