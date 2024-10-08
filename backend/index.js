const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); // Import bcrypt
const cors = require('cors'); // Import CORS middleware
const { User } = require('./models/user'); // Import User model
const userRouter = require('./routes/user');
const classroomRouter = require('./routes/classroom');
const timetableRouter = require('./routes/timetable');

dotenv.config(); // Load environment variables

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Allow all origins (change this to restrict origins)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions)); // Use CORS middleware

app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB connected');

    // Create default principal account if it does not exist
    const principal = await User.findOne({ username: 'principal@classroom.com' });
    if (!principal) {
      const hashedPassword = await bcrypt.hash('Admin', 10);
      await User.create({
        username: 'principal@classroom.com',
        password: hashedPassword,
        role: 'principal',
      });
      console.log('Default principal account created');
    } else {
      console.log('Principal account already exists');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB or creating default principal account:', error);
    process.exit(1);
  }
};

connectDB();

// Use routes
app.use('/api', userRouter);
app.use('/api/classrooms', classroomRouter);
app.use('/api/timetables', timetableRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
