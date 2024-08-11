import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateUserForm from '../components/Principal/Signup'; // Adjust import path as needed
import { getRole, getToken } from '../utils/auth';

const BACKEND_URL = 'https://classroom-phi-seven.vercel.app';

const PrincipalDashboard = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [newClassroom, setNewClassroom] = useState({
    name: '',
    startTime: '',
    endTime: '',
    days: '',
    teacherId: ''
  });
  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [selectedClassroomForTimetable, setSelectedClassroomForTimetable] = useState(null);
  const [newTimetable, setNewTimetable] = useState({});

  const role = getRole();
  const token = getToken();

  useEffect(() => {
    if (role !== 'principal') {
      return; // Optionally, you can redirect or show an access denied message
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/users`, {
          headers: { Authorization: ` ${token}` },
        });
        setTeachers(response.data.teachers || []);
        setStudents(response.data.students || []);

        // Fetch classrooms
        const classroomsResponse = await axios.get(`${BACKEND_URL}/api/classrooms`, {
          headers: { Authorization: ` ${token}` },
        });
        setClassrooms(classroomsResponse.data.classrooms || []);
      } catch (error) {
        setError('Error fetching data');
      }
    };

    fetchData();
  }, [role, token]);

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/${userId}`, {
        headers: { Authorization: ` ${token}` },
      });
      // Refresh the lists
      setTeachers(teachers.filter((teacher) => teacher._id !== userId));
      setStudents(students.filter((student) => student._id !== userId));
    } catch (error) {
      setError('Error deleting user');
    }
  };

  const handleEditUser = async (userId, updatedUser) => {
    try {
      await axios.put(`${BACKEND_URL}/api/${userId}`, updatedUser, {
        headers: { Authorization: ` ${token}` },
      });
      // Refresh the lists
      const updatedTeachers = teachers.map((teacher) =>
        teacher._id === userId ? { ...teacher, ...updatedUser } : teacher
      );
      const updatedStudents = students.map((student) =>
        student._id === userId ? { ...student, ...updatedUser } : student
      );
      setTeachers(updatedTeachers);
      setStudents(updatedStudents);
      setEditingUser(null);
    } catch (error) {
      setError('Error updating user');
    }
  };

  const handleCreateClassroom = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/classrooms/create`, newClassroom, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      // Refresh the classrooms list
      const response = await axios.get(`${BACKEND_URL}/api/classrooms`, {
        headers: { Authorization: ` ${token}` },
      });
      setClassrooms(response.data.classrooms || []);
      alert('Classroom created successfully');
    } catch (error) {
      console.error('Error creating classroom:', error);
      alert('Error creating classroom');
    }
  };

  const handleAssignClassroom = async () => {
    try {
      // Assign the teacher to the selected classroom
      await axios.post(`${BACKEND_URL}/api/classrooms/${selectedClassroom}/assign-teacher`, { teacherId: assignTeacherId }, {
        headers: { Authorization: ` ${token}` },
      });
  
      // Refresh the classrooms list
      const response = await axios.get(`${BACKEND_URL}/api/classrooms`, {
        headers: { Authorization: ` ${token}` },
      });
      setClassrooms(response.data.classrooms || []);
      
      alert('Teacher assigned to classroom successfully');
    } catch (error) {
      console.error('Error assigning teacher to classroom:', error);
      alert('Error assigning teacher to classroom');
    }
  };
  

  const handleViewTimetables = async (classroomId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/timetables/${classroomId}`, {
        headers: { Authorization: ` ${token}` },
      });
      setTimetables(response.data.timetables || []);
      setSelectedClassroomForTimetable(classroomId);
    } catch (error) {
      console.error('Error fetching timetables:', error);
      alert('Error fetching timetables');
    }
  };

  const handleEditTimetable = async (timetableId) => {
    try {
      await axios.put(`${BACKEND_URL}/api/timetable/${timetableId}`, newTimetable, {
        headers: { Authorization: ` ${token}` },
      });
      // Refresh the timetables list
      handleViewTimetables(selectedClassroomForTimetable);
      alert('Timetable updated successfully');
    } catch (error) {
      console.error('Error updating timetable:', error);
      alert('Error updating timetable');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Principal Dashboard</h1>

      {error && <div className="bg-red-200 text-red-700 p-2 mb-4 rounded">{error}</div>}

      <CreateUserForm />

      {/* Create Classroom Form */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Create Classroom</h2>
        <input
          type="text"
          value={newClassroom.name}
          onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
          placeholder="Classroom Name"
          className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="time"
          value={newClassroom.startTime}
          onChange={(e) => setNewClassroom({ ...newClassroom, startTime: e.target.value })}
          className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="time"
          value={newClassroom.endTime}
          onChange={(e) => setNewClassroom({ ...newClassroom, endTime: e.target.value })}
          className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          value={newClassroom.days}
          onChange={(e) => setNewClassroom({ ...newClassroom, days: e.target.value })}
          placeholder="Days (e.g., Mon, Tue, Wed)"
          className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
        />
        <select
          value={newClassroom.teacherId}
          onChange={(e) => setNewClassroom({ ...newClassroom, teacherId: e.target.value })}
          className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select Teacher</option>
          {teachers.map(teacher => (
            <option key={teacher._id} value={teacher._id}>{teacher.username}</option>
          ))}
        </select>
        <button
          onClick={handleCreateClassroom}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Classroom
        </button>
      </div>

      {/* Assign Classroom to Teacher */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Assign Classroom to Teacher</h2>
        <select
          value={selectedClassroom}
          onChange={(e) => setSelectedClassroom(e.target.value)}
          className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select Classroom</option>
          {classrooms.map(classroom => (
            <option key={classroom._id} value={classroom._id}>{classroom.name}</option>
          ))}
        </select>
        <select
          value={assignTeacherId}
          onChange={(e) => setAssignTeacherId(e.target.value)}
          className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select Teacher</option>
          {teachers.map(teacher => (
            <option key={teacher._id} value={teacher._id}>{teacher.username}</option>
          ))}
        </select>
        <button
          onClick={handleAssignClassroom}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Assign Classroom
        </button>
      </div>

      {/* View and Edit Timetables */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Classrooms</h2>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Classroom Name</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classrooms.length ? (
              classrooms.map((classroom) => (
                <tr key={classroom._id}>
                  <td className="px-4 py-2 border-b">{classroom.name}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => handleViewTimetables(classroom._id)}
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                    >
                      View Timetables
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-4 py-2 border-b text-center">No classrooms available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Timetable Editing */}
      {selectedClassroomForTimetable && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Timetables for Classroom</h2>
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Start Time</th>
                <th className="px-4 py-2 border-b">End Time</th>
                <th className="px-4 py-2 border-b">Days</th>
                <th className="px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {timetables.length ? (
                timetables.map((timetable) => (
                  <tr key={timetable._id}>
                    <td className="px-4 py-2 border-b">{timetable.startTime}</td>
                    <td className="px-4 py-2 border-b">{timetable.endTime}</td>
                    <td className="px-4 py-2 border-b">{timetable.days}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => setNewTimetable({ ...timetable })}
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-2 border-b text-center">No timetables available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Timetable Form */}
      {newTimetable && (
        <div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded">
          <h2 className="text-2xl font-semibold mb-4">Edit Timetable</h2>
          <input
            type="time"
            value={newTimetable.startTime}
            onChange={(e) => setNewTimetable({ ...newTimetable, startTime: e.target.value })}
            className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="time"
            value={newTimetable.endTime}
            onChange={(e) => setNewTimetable({ ...newTimetable, endTime: e.target.value })}
            className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            value={newTimetable.days}
            onChange={(e) => setNewTimetable({ ...newTimetable, days: e.target.value })}
            placeholder="Days (e.g., Mon, Tue, Wed)"
            className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={() => handleEditTimetable(newTimetable._id)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </div>
      )}

      {/* Existing Users List */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Teachers</h2>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Username</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length ? (
              teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td className="px-4 py-2 border-b">{teacher.username}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => handleDeleteUser(teacher._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setEditingUser(teacher)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-4 py-2 border-b text-center">No teachers available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Students</h2>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Username</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length ? (
              students.map((student) => (
                <tr key={student._id}>
                  <td className="px-4 py-2 border-b">{student.username}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => handleDeleteUser(student._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setEditingUser(student)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-4 py-2 border-b text-center">No students available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Form */}
      {editingUser && (
        <div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded">
          <h2 className="text-2xl font-semibold mb-4">Edit User</h2>
          <input
            type="text"
            value={editingUser.username}
            onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
            placeholder="Username"
            className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="password"
            value={editingUser.password || ''}
            onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
            placeholder="Password"
            className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={() => handleEditUser(editingUser._id, { username: editingUser.username, password: editingUser.password })}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default PrincipalDashboard;
