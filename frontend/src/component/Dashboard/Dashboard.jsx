import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useState(null);
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/user/users', { withCredentials: true });
        if (userRole === 'admin') {
          setUsers(response.data); // Admin gets all users
        } else {
          setUserData(response.data); // Regular user gets only their data
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [userRole]);


  const deleteHandler= async(id)=>{
      // console.log(id)
      try {
           await axios.delete(`http://localhost:8000/user/deleteuser/${id}`,{ withCredentials: true })
           setUsers(users.filter(user => user._id !== id))
           console.log(users)
      } catch (error) {
          console.error('Error deleting user:', error);
      }
  }
  return (
    <div>
      
      {userRole === 'admin' ? (
        <div>
          <h2>UserInfo</h2>
          <table className='table table-hover table-responsive'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.role}</td>
                  <td>
                    <Link to={`/useredit/${user._id}`}  className='bg-info btn mx-2'>Edit</Link>
                    <button className='btn btn-danger' onClick={() => deleteHandler(user._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <h3>User Information</h3>
          {userData && (
            // <ul>
            //   <li><strong>Name:</strong> {userData.name}</li>
            //   <li><strong>Email:</strong> {userData.email}</li>
            //   <li><strong>Phone:</strong> {userData.phone}</li>
            //   <li><strong>Role:</strong> {userData.role}</li>
            // </ul>

            <div>
              <table>
                <thead>
                  <tr>
                    <td>Name</td>
                    <td>Email</td>
                     <td>Phone</td>
                     <td>Role</td>
                  </tr>
                </thead>

                <tbody></tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
