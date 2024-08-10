const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { User } = require('../models/user'); // Ensure the correct path to your model
const userRouter = require('../routes/user'); // Ensure the correct path to your routes

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/classroom');
        console.log('MongoDB connected');

        // Check if the principal account already exists
        const principal = await User.findOne({ username: 'principal@classroom.com' });
        if (!principal) {
            // Create the default principal account
            const hashedPassword = await bcrypt.hash('Admin', 10);
            await User.create({
                username: 'principal@classroom.com',
                password: hashedPassword,
                role: 'principal'
            });
            console.log('Default principal account created');
        }
    } catch (error) {
        console.error('Error connecting to MongoDB or creating default principal account:', error);
        process.exit(1);
    }
};
connectDB();

// Use routes
app.use('/api', userRouter);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
