import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GanttChart } from 'smart-webcomponents-react/ganttchart';
import 'smart-webcomponents-react/source/styles/smart.default.css';
import io from 'socket.io-client';
import TaskStatistics from '../StatisticsCharts/TaskStatsChart';

const socket = io('http://localhost:8000');  // Connect to the Socket.IO server

function ShowList() {
  const [show, setShow] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const user = localStorage.getItem('username');

  // console.log(users)

  useEffect(() => {
    // Fetch initial task data
    axios.get('http://localhost:8000/task/showtask')
      .then(response => {
        setShow(response.data.data);
      })
      .catch(error => {
        console.error(error);
      });

    axios.get("http://localhost:8000/user/alluser")
      .then(response => { setUsers(response.data.allUser)
        // console.log("User data:", response.data);  // Debugging line
      });
   


    axios.get('http://localhost:8000/notification/get')
      .then(response => setNotifications(response.data.data))
      .catch(error => console.error("Error fetching notifications:", error));

    // Listen for task updates
    socket.on('taskUpdated', (notification) => {
      setNotifications(prev => [...prev, notification]);
    });

    return () => {
      socket.off('taskUpdated');  // Clean up the listener on unmount
    };
  }, []);

  const handleAssign = async (taskId, userId) => {
    try {
      await axios.put("http://localhost:8000/task/assignTask", { taskId, userId },{withCredentials:true});

      // Update UI
      setShow(show.map(task =>
        task._id === taskId ? { ...task, assigneeId: users.find(user => user._id === userId) } : task
      ));

      alert("Task assigned successfully!");
    } catch (error) {
      console.error("Error assigning task:", error);
    }
  };


  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/task/taskdelete/${id}`);
      setShow(show.filter(shows => shows._id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };



  // Remove notification
  const removeNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/notification/delete/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };


  // Convert task data for GanttChart
  const ganttData = show.map(task => ({
    label: task.title,
    dateStart: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '2024-01-01',
    dateEnd: task.dueDate ? new Date(new Date(task.dueDate).getTime() + (24 * 60 * 60 * 1000)).toISOString().split('T')[0] : '2025-01-02',
    class: task.status?.toLowerCase().replace(' ', '-') || 'default-task',
    type: 'task'
  }));

  return (
    <div>
      <div className="mt-4 text-center">
        <h1>Show Task Management Data</h1>
      </div>

      <div className='table-responsive'>
        <Link to={'/newtask'} className='btn bg-success ms-1'>New Task <i className="fa-solid fa-plus"></i></Link>
        <Link to={'/kanban'} className='btn bg-info mx-2'>Kanban View Task</Link>
        <Link to={'/table'} className='btn bg-primary'>Tabular View</Link>


        {/* Notifications */}
        <div className="mt-3">
          <h2>Notifications</h2>
          {notifications.length > 0 ? (
            <ul className="list-group">
              {notifications.map((notification) => (
                <li key={notification._id} className="list-group-item d-flex justify-content-between">
                  {notification.message}
                  <button className="btn btn-danger btn-sm" onClick={() => removeNotification(notification._id)}>X</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No notifications</p>
          )}
        </div>

        <table className="table table-hover table-responsive mt-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {show.map((task) => (
              <tr key={task._id}>
                <td>{task._id}</td>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>{task.status}</td>
                <td>{task.priority}</td>
                <td>
                  <select
                    value={task.assigneeId ? task.assigneeId._id : ""}
                    onChange={(e) => handleAssign(task._id, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {Array.isArray(users) && users.length > 0 ? (
                      users.map(user => (
                        <option key={user._id} value={user._id}>{user.name}</option>
                      ))
                    ) : (
                      <option disabled>Loading users...</option>
                    )}
                  </select>
                </td>

                <td>
                  <Link to={`/taskedit/${task._id}`} className='btn bg-info mx-2'>Edit</Link>
                  <button className='btn bg-danger' onClick={() => handleDelete(task._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {/* Gantt Chart View */}
      <div className="mt-5">
        <h3 className="text-center">Gantt Chart View</h3>
        <GanttChart
          dataSource={ganttData}
          treeSize="30%"
          durationUnit="day"
          id="gantt"
        />
      </div>

      <TaskStatistics></TaskStatistics>
    </div>
  );
}

export default ShowList;
