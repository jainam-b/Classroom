const express = require("express");
const { Classroom } = require("../models/classroom");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();
const authenticate = require("../middleware/authMiddleware"); // Importing the authentication middleware
const JWT_SECRET = process.env.JWT_SECRET;

// Create Classroom route
router.post("/create", authenticate, async (req, res) => {
  const { name, startTime, endTime, days, teacherId } = req.body;

  if (!name || !startTime || !endTime || !days || !teacherId) {
    return res.status(400).json({
      message:
        "Please provide name, start time, end time, days, and teacher ID",
    });
  }
  console.log("Teacher ID from request:", teacherId);

  const teacher = await User.findById(teacherId);
  console.log("Teacher found:", teacher);

  try {
    const currentUser = await User.findById(req.user.id);

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

    res.status(201).json({
      message: "Classroom created successfully",
      classroom: newClassroom,
    });
  } catch (error) {
    console.error("Error creating classroom:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update Classroom route (Principal only)
router.put("/:id", authenticate, async (req, res) => {
  const { name, startTime, endTime, days, teacherId } = req.body;

  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser || currentUser.role !== "principal") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Verify that the teacher exists if teacherId is provided
    if (teacherId) {
      const teacher = await User.findById(teacherId);

      if (!teacher || teacher.role !== "teacher") {
        return res
          .status(404)
          .json({ message: "Teacher not found or not valid" });
      }
    }

    const updatedClassroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      { name, startTime, endTime, days, teacher: teacherId },
      { new: true }
    );

    if (!updatedClassroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    res
      .status(200)
      .json({
        message: "Classroom updated successfully",
        classroom: updatedClassroom,
      });
  } catch (error) {
    console.error("Error updating classroom:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete Classroom route (Principal only)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser || currentUser.role !== "principal") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const deletedClassroom = await Classroom.findByIdAndDelete(req.params.id);

    if (!deletedClassroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    res.status(200).json({ message: "Classroom deleted successfully" });
  } catch (error) {
    console.error("Error deleting classroom:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
