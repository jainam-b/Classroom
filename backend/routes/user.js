const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const router = express.Router();
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;


// Signup route
router.post('/signup', async (req, res) => {
    const { username, password, role } = req.body;
    const token = req.headers.authorization;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Please provide username, password, and role' });
    }

    try {
        // Verify the token and role of the user making the request
        const decoded = jwt.verify(token, JWT_SECRET);
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check if the current user is allowed to create accounts
        if (
            (currentUser.role === 'principal' && (role === 'teacher' || role === 'student')) ||
            (currentUser.role === 'teacher' && role === 'student')
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
                { expiresIn: '1h' }
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
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
