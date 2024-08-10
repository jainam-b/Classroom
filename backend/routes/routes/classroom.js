const express = require("express");
const { Classroom } = require("../../models/classroom");
const { User } = require("../../models/user");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

// Create Classroom route
router.post("/create", async (req, res) => {
  const { name, startTime, endTime, days, teacherId } = req.body;
  const token = req.headers.authorization;

  if (!name || !startTime || !endTime || !days || !teacherId) {
    return res
      .status(400)
      .json({
        message:
          "Please provide name, start time, end time, days, and teacher ID",
      });
  }

  try {
    // Verify the token and role of the user making the request
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser || currentUser.role !== "principal") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Verify that the teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res
        .status(404)
        .json({ message: "Teacher not found or not valid" });
    }

    // Create new classroom
    const newClassroom = await Classroom.create({
      name,
      startTime,
      endTime,
      days,
      teacher: teacherId,
    });

    res
      .status(201)
      .json({
        message: "Classroom created successfully",
        classroom: newClassroom,
      });
  } catch (error) {
    console.error("Error creating classroom:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
