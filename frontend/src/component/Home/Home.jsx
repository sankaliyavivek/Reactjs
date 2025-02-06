import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import io from 'socket.io-client';
import ProjectStatsChart from '../StatisticsCharts/ProjectStatsChart';

// Connect to the socket server
const socket = io('http://localhost:8000'); // Backend URL

function Home() {
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [notifications, setNotifications] = useState([]);
    const [users, setUsers] = useState([]);  // Initialize users as an empty array
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false); // Toggle modal
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const user = localStorage.getItem('username');
    const userRole = localStorage.getItem('role');
    // console.log(users)
    useEffect(() => {
        // Fetch projects
        axios.get('http://localhost:8000/project/get')
            .then((response) => setProjects(response.data.data))
            .catch((error) => setError(error.response?.data?.message || "Failed to fetch projects"));

        // Fetch users
        axios.get('http://localhost:8000/user/alluser')
            .then((response) => {
                // console.log(response.data); // Check if data is correct
                setUsers(response.data.allUser);
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
                setUsers([]); // In case of an error, set users to an empty array
            });

            // show notifications
        axios.get('http://localhost:8000/notification/get')
            .then(response => setNotifications(response.data.data || []))
            .catch(error => console.error("Error fetching notifications:", error));


        // Listen for project updates via Socket.IO
        socket.on('projectUpdated', (projectData) => {
            console.log('Received project update:', projectData);
            setNotifications(prev => [
                { message: `Project "${projectData.title}" has been updated.`, createdAt: new Date() },
                ...prev
            ]);
        });

        socket.on('userAssigned', (data) => {
            setNotifications(prev => [
                { message: data.message, createdAt: new Date() },
                ...prev
            ]);
        });

        socket.on('userRemoved', (data) => {
            setNotifications(prev => [
                { message: data.message, createdAt: new Date() },
                ...prev
            ]);
        });

        return () => {
            socket.off('projectUpdated');
            socket.off('userAssigned');
            socket.off('userRemoved');
        };
    }, []);

    const removeNotification = async (id) => {

        try {
            await axios.delete(`http://localhost:8000/notification/delete/${id}`, { withCredentials: true });
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error('Error removing notification:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/project/delete/${id}`);
            setProjects(projects.filter(project => project._id !== id));
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    const handleAssignUsers = async () => {
        if (!selectedProjectId || selectedUsers.length === 0) return;

        if (userRole !== 'admin') {
            alert('You are not authorized to assign users to this project');
            return;
        }

        try {
            const projectToUpdate = projects.find(project => project._id === selectedProjectId);
            const currentAssignedUsers = projectToUpdate ? projectToUpdate.assignedTeam : [];

            // Remove duplicates
            const updatedAssignedUsers = [...new Set([...currentAssignedUsers, ...selectedUsers])];

            // Send request to backend
            await axios.put(`http://localhost:8000/user/assignuser/${selectedProjectId}`,
                { userIds: updatedAssignedUsers },
                { withCredentials: true }
            );

            // Update local state
            setProjects(prevProjects => prevProjects.map(project =>
                project._id === selectedProjectId ? { ...project, assignedTeam: updatedAssignedUsers } : project
            ));

            setIsAssigning(false);
        } catch (error) {
            console.error('Error assigning users:', error);
        }
    };

    const handleRemoveAssignedUser = async (projectId, userId) => {
        if (userRole !== 'admin') {
            alert('You are not authorized to remove users to this project');
            return;
        }
        try {
            await axios.delete(`http://localhost:8000/user/removeuser/${projectId}/${userId}`, { withCredentials: true });

            // Update UI
            setProjects(prevProjects => prevProjects.map(project =>
                project._id === projectId
                    ? { ...project, assignedTeam: project.assignedTeam.filter(id => id !== userId) }
                    : project
            ));
        } catch (error) {
            console.error('Error removing user from project:', error);
        }
    };

    const formatDate = (date) => new Date(date).toISOString().split('T')[0];

    const projectsForSelectedDate = projects.filter(project =>
        formatDate(project.dueDate) === formatDate(selectedDate)
    );

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = formatDate(date);
            if (projects.some(project => formatDate(project.dueDate) === dateStr)) {
                return 'highlight';
            }
        }
        return null;
    };
    return (
        <>
            <div className="mt-4">
                <div className="">
                    <button className='btn bg-info'>
                        <Link to={'/newproject'} className='none'>
                            Create New Project <i className="fa-solid fa-plus"></i>
                        </Link>
                    </button>
                </div>
                <div className="text-center">
                    <h1>Show Project Data</h1>
                </div>
                {error && <p className="text-danger text-center">{error}</p>}

                {projects.length > 0 ? (
                    <div className='table-responsive'>
                        <table className="table table-hover mt-4">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Due Date</th>
                                    <th>Assigned Users</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project, index) => (
                                    <tr key={project._id}>
                                        <td>{project._id}</td>
                                        <td>{project.title}</td>
                                        <td>{project.description}</td>
                                        <td>{new Date(project.startDate).toLocaleDateString()}</td>
                                        <td>{new Date(project.endDate).toLocaleDateString()}</td>
                                        <td>{new Date(project.dueDate).toLocaleDateString()}</td>
                                        <td>
                                            {Array.isArray(project.assignedTeam) && project.assignedTeam.length > 0 ? (
                                                project.assignedTeam.map((userId, index) => {
                                                    const userObj = users.find(user => user._id === userId);
                                                    return userObj ? (
                                                        <span key={index} className="d-flex align-items-center">
                                                            {userObj.name}
                                                            <button
                                                                onClick={() => handleRemoveAssignedUser(project._id, userObj._id)}
                                                                className="btn btn-danger btn-sm mx-1"
                                                            >
                                                                X
                                                            </button>
                                                        </span>
                                                    ) : null;
                                                })
                                            ) : (
                                                <span>No users assigned</span>
                                            )}
                                        </td>
                                        {user ?
                                            (
                                                <td>
                                                    <Link to={`/edit/${project._id}`} className='bg-info btn '>Edit</Link>
                                                    <button onClick={() => handleDelete(project._id)} className='bg-danger btn mx-1'>Delete</button>
                                                    <button onClick={() => { setIsAssigning(true); setSelectedProjectId(project._id); setSelectedUsers([]); }} className='bg-primary btn'>Assign</button>
                                                </td>
                                            )

                                            : (
                                                <td>To update or delete your project, please log in first</td>
                                            )}

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    !error && <p className="text-center mt-3">No projects available.</p>
                )}
            </div>

            {/* Modal for Assign Users */}

            {isAssigning && (

                <div className="modal d-flex justify-content-center align-items-center mt-5 w-100 " >
                    <div className="modal-content p-2 w-50  d-flex justify-content-center">
                        <div className='text-end'>
                            <span className="close btn bg-danger " onClick={() => setIsAssigning(false)}>X</span>
                        </div>
                        <h2 className='text-center'>Assign Users to Project</h2>
                        <div className='d-flex justify-content-center'>
                            <select multiple value={selectedUsers} className='w-100' onChange={e => setSelectedUsers([...e.target.selectedOptions].map(option => option.value))}>
                                {Array.isArray(users) && users.length > 0 ? (
                                    users.map(user => (
                                        <option key={user._id} value={user._id}>{user.name}</option>
                                    ))
                                ) : (
                                    <option>No users available</option>
                                )}
                            </select>
                        </div>
                        <div className='text-center'>
                            <button onClick={handleAssignUsers} className="btn btn-primary mt-2 w-50">Assign</button>
                        </div>
                    </div>

                </div>
            )}
            {/* Notification Section */}
            <div className="mt-5">
                <h2>Notifications</h2>
                {notifications.length > 0 ? (
                    <ul className="list-group">
                        {notifications.map((notification) => (
                            <li key={notification._id} className="list-group-item d-flex justify-content-between">
                                {notification.message}
                                <span className='btn bg-danger' onClick={() => removeNotification(notification._id)}>X</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No notifications</p>
                )}
            </div>
            <div className="mt-5 text-center d-flex flex-column justify-content-center">
                <h2>Project Due Date Calendar</h2>
                <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileClassName={tileClassName}
                />
                <div className="mt-3">
                    <h4>Projects Due on {selectedDate.toDateString()}:</h4>
                    {projectsForSelectedDate.length > 0 ? (
                        <ul className="list-group">
                            {projectsForSelectedDate.map(project => (
                                <li key={project._id} className="list-group-item">
                                    <strong>{project.title}</strong> - Due: {new Date(project.dueDate).toLocaleDateString()}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No projects due on this date.</p>
                    )}
                </div>
            </div>
            <ProjectStatsChart />
            <style>
                {`
                    .highlight {
                        background-color: #ffcc00 !important;
                        border-radius: 50%;
                    }
                    `}
            </style>
        </>
    );
}
export default Home;
