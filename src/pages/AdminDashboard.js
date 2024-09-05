import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { getAuth, deleteUser as deleteAuthUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css'; // Import global styles
import './AdminDashboard.css'; // Import specific styles for AdminDashboard

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'user-data');
      const usersSnapshot = await getDocs(usersCollection);
      const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
      setLoading(false);
    };

    fetchUsers();
  }, [db]);

  const handleRoleChange = async (userId, newRole) => {
    const roleToUpdate = newRole === 'student' ? 'user' : newRole;
    if (window.confirm('Are you sure you want to change the user role?')) {
      const userDoc = doc(db, 'user-data', userId);
      await updateDoc(userDoc, { role: roleToUpdate });
      alert('Role updated successfully.');
      // Refresh user list
      const usersCollection = collection(db, 'user-data');
      const usersSnapshot = await getDocs(usersCollection);
      const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    }
  };

  const handleApprovalChange = async (userId, newApprovalStatus) => {
    const isApproved = newApprovalStatus === 'true'; // Convert to boolean
    if (window.confirm('Are you sure you want to change the approval status?')) {
      const userDoc = doc(db, 'user-data', userId);
      await updateDoc(userDoc, { approved: isApproved });
      alert('Approval status updated successfully.');
      // Refresh user list
      const usersCollection = collection(db, 'user-data');
      const usersSnapshot = await getDocs(usersCollection);
      const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    }
  };

  const handleBanChange = async (userId, newBanStatus) => {
    const isBanned = newBanStatus === 'true'; // Convert to boolean
    if (window.confirm('Are you sure you want to change the ban status?')) {
      const userDoc = doc(db, 'user-data', userId);
      await updateDoc(userDoc, { banned: isBanned });
      alert('Ban status updated successfully.');
      // Refresh user list
      const usersCollection = collection(db, 'user-data');
      const usersSnapshot = await getDocs(usersCollection);
      const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    }
  };

  
const handleDeleteUser = async (userId) => {
  if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    try {
      // Fetch user data to get the user's Firebase Authentication ID
      const userDoc = doc(db, 'user-data', userId);
      const userSnapshot = await getDoc(userDoc);
      const userData = userSnapshot.data();

      if (userData && userData.authUID) {
        // Delete the user from Firebase Authentication using the correct UID
        const userAuth = await auth.getUser(userData.authUID);
        await deleteAuthUser(userAuth.uid);
      } else {
        console.error('No authUID found for user.');
        alert('Failed to delete user from Authentication.');
        return; // Exit the function if UID is not found
      }

      // Delete the user from Firestore
      await deleteDoc(userDoc);

      alert('User deleted successfully.');

      // Refresh user list
      const usersCollection = collection(db, 'user-data');
      const usersSnapshot = await getDocs(usersCollection);
      const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    } catch (error) {
      console.error('Error deleting user: ', error);
      alert('Failed to delete user.');
    }
  }
};

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <button className="go-back-button" onClick={() => navigate('/')}>Go Back to Home Screen</button>
      <table className="user-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Approved</th>
            <th>Banned</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.role === 'user' ? 'student' : user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <select
                  value={user.approved ? 'true' : 'false'}
                  onChange={(e) => handleApprovalChange(user.id, e.target.value)}
                >
                  <option value="true">Approved</option>
                  <option value="false">Unapproved</option>
                </select>
              </td>
              <td>
                <select
                  value={user.banned ? 'true' : 'false'}
                  onChange={(e) => handleBanChange(user.id, e.target.value)}
                >
                  <option value="true">Banned</option>
                  <option value="false">Not Banned</option>
                </select>
              </td>
              <td>
                <button className="delete-button" onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
