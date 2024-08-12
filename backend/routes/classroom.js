const express = require("express");
const { Classroom } = require("../models/classroom");
const { User } = require("../models/user");
const { Timetable } = require("../models/timetable");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

// Create Classroom route
router.post("/create", authenticate, async (req, res) => {
  const { name, startTime, endTime, days, teacherId, capacity, subject } = req.body;

  if (!name || !startTime || !endTime || !days || !teacherId) {
    return res.status(400).json({
      message: "Please provide name, start time, end time, days, and teacher ID",
    });
  }

  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser || currentUser.role !== "principal") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found or not valid" });
    }

    const newClassroom = await Classroom.create({
      name,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      days,
      teacher: teacherId,
      capacity: capacity || 30,
      subject,
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
  const { name, startTime, endTime, days, teacherId, capacity, subject } = req.body;

  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser || currentUser.role !== "principal") {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (teacherId) {
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== "teacher") {
        return res.status(404).json({ message: "Teacher not found or not valid" });
      }
    }

    const updatedClassroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        days, 
        teacher: teacherId,
        capacity,
        subject
      },
      { new: true }
    );

    if (!updatedClassroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    res.status(200).json({
      message: "Classroom updated successfully",
      classroom: updatedClassroom,
    });
  } catch (error) {
    console.error("Error updating classroom:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Assign Student to Classroom route (Principal or Teacher)
router.post("/:classroomId/assign-student", authenticate, async (req, res) => {
  const { studentId } = req.body;

  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser || (currentUser.role !== "principal" && currentUser.role !== "teacher")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found or not valid" });
    }

    const classroom = await Classroom.findById(req.params.classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (currentUser.role === "teacher" && classroom.teacher.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (classroom.students.length >= classroom.capacity) {
      return res.status(400).json({ message: "Classroom is at full capacity" });
    }

    if (!classroom.students.includes(student._id)) {
      classroom.students.push(student._id);
      await classroom.save();
    }

    student.classroom = classroom._id;
    await student.save();

    res.status(200).json({ message: "Student assigned to classroom successfully", student });
  } catch (error) {
    console.error("Error assigning student to classroom:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all assigned students for a teacher
router.get('/teacher/:teacherId/students', authenticate, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || (currentUser.role !== 'principal' && currentUser.role !== 'teacher')) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (currentUser.role === 'teacher' && currentUser._id.toString() !== req.params.teacherId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const teacher = await User.findById(req.params.teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const classroom = await Classroom.findOne({ teacher: teacher._id });
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found for this teacher' });
    }

    const students = await User.find({ _id: { $in: classroom.students } });
    res.status(200).json({ students });
  } catch (error) {
    console.error('Error fetching assigned students:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Assign a teacher to a student (effectively assigning student to teacher's classroom)
router.post('/assign-teacher-to-student', authenticate, async (req, res) => {
  const { teacherId, studentId } = req.body;

  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || currentUser.role !== 'principal') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found or not valid' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found or not valid' });
    }

    const classroom = await Classroom.findOne({ teacher: teacher._id });
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found for this teacher' });
    }

    if (classroom.students.length >= classroom.capacity) {
      return res.status(400).json({ message: "Classroom is at full capacity" });
    }

    if (!classroom.students.includes(student._id)) {
      classroom.students.push(student._id);
      await classroom.save();
    }

    student.classroom = classroom._id;
    await student.save();

    res.status(200).json({ message: 'Teacher assigned to student successfully', student });
  } catch (error) {
    console.error('Error assigning teacher to student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;