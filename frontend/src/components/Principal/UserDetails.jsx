import React, { useState, useEffect } from 'react';
import axios from 'axios';
 
import { getRole, getToken } from '../../utils/auth';

const BACKEND_URL = 'https://classroom-phi-seven.vercel.app';

const UserDetails = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  const role = getRole();
  const token = getToken();

  useEffect(() => {
    if (role !== 'principal') {
      return; // Optionally, you can redirect or show an access denied message
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/users`, {
          headers: { Authorization: `${token}` },
        });
        setTeachers(response.data.teachers || []);
        setStudents(response.data.students || []);
      } catch (error) {
        setError('Error fetching users');
      }
    };

    fetchData();
  }, [role, token]);

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/${userId}`, {
        headers: { Authorization: `${token}` },
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
        headers: { Authorization: `${token}` },
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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Principal Dashboard</h1>

      {error && <div className="bg-red-200 text-red-700 p-2 mb-4 rounded">{error}</div>}

      

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

export default UserDetails;
