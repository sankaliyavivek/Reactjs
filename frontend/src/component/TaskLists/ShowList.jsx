  import axios from 'axios';
  import React, { useEffect, useState } from 'react';
  import { Link } from 'react-router-dom';
  import { GanttChart } from 'smart-webcomponents-react/ganttchart';
  import 'smart-webcomponents-react/source/styles/smart.default.css';
  import io from 'socket.io-client';
  import TaskStatistics from '../StatisticsCharts/TaskStatsChart';

  const socket = io('http://localhost:8000'); 

  function ShowList() {
    const [tasks, setTasks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [users, setUsers] = useState([]);
    const user = localStorage.getItem('username');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    useEffect(() => {
      axios.get('http://localhost:8000/task/showtask')
        .then(response => setTasks(response.data.data))
        .catch(error => console.error(error));

      axios.get("http://localhost:8000/user/alluser")
        .then(response => setUsers(response.data.allUser));

      axios.get('http://localhost:8000/notification/get')
        .then(response => setNotifications(response.data.data))
        .catch(error => console.error("Error fetching notifications:", error));

      socket.on('taskUpdated', (notification) => {
        setNotifications(prev => [...prev, notification]);
      });

      socket.on('taskAssigned', (notification) => {
        setNotifications(prev => [...prev, notification]);
      });

      socket.on('taskUnassigned', (notification) => {
        setNotifications(prev => [...prev, notification]);
      });

      return () => {
        socket.off('taskUpdated');
        socket.off('taskAssigned');
        socket.off('taskUnassigned');
      };
    }, []);

    const handleAssign = async () => {
      if (!selectedTaskId || selectedUsers.length === 0) return;
      try {
        const response = await axios.put(
          `http://localhost:8000/task/assignTask/${selectedTaskId}`,
          { userIds: selectedUsers },
          { withCredentials: true }
        );

        setTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === selectedTaskId
              ? { ...task, assigneeId: [...new Set([...task.assigneeId, ...selectedUsers])] }
              : task
          )
        );
        setIsAssigning(false);
        alert("Task assigned successfully!");
      } catch (error) {
        console.error("Error assigning task:", error);
        alert(`Error: ${error.response?.data?.message || error.message}`);
      }
    };

    const handleRemoveAssignedUser = async (taskId, userId) => {
      try {
          await axios.delete(`http://localhost:8000/task/unassignTask/${taskId}/${userId}`,{withCredentials:true});
          setTasks(prevTasks =>
              prevTasks.map(task =>
                  task._id === taskId
                      ? { ...task, assigneeId: task.assigneeId.filter(id => id !== userId) }
                      : task
              )
          );
      } catch (error) {
          console.error("Error removing user:", error);
      }
  };
  

    const handleDelete = async (id) => {
      try {
        await axios.delete(`http://localhost:8000/task/taskdelete/${id}`);
        setTasks(tasks.filter(task => task._id !== id));
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    };

    const removeNotification = async (id) => {
      try {
        await axios.delete(`http://localhost:8000/notification/delete/${id}`);
        setNotifications(notifications.filter(n => n._id !== id));
      } catch (error) {
        console.error('Error removing notification:', error);
      }
    };

    const ganttData = tasks.map(task => ({
      label: task.title,
      dateStart: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '2024-01-01',
      dateEnd: task.dueDate ? new Date(new Date(task.dueDate).getTime() + 86400000).toISOString().split('T')[0] : '2025-01-02',
      type: 'task'
    }));

    return (
      <div>
        <h1 className="mt-4 text-center">Show Task Management Data</h1>
        <div className='table-responsive'>
          <Link to={'/newtask'} className='btn bg-success ms-1'>New Task <i className="fa-solid fa-plus"></i></Link>
          <Link to={'/kanban'} className='btn bg-info mx-2'>Kanban View Task</Link>
          <Link to={'/table'} className='btn bg-primary'>Tabular View</Link>

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
            ) : <p>No notifications</p>}
          </div>

          <table className="table table-hover table-responsive mt-4">
            <thead>
              <tr><th>ID</th><th>Title</th><th>Description</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td>{task._id}</td>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>{task.status}</td>
                  <td>{task.priority}</td>
                  <td>
                    {task.assigneeId?.length > 0 ? (
                      task.assigneeId.map((userId, index) => {
                        const userObj = users.find(user => user._id === userId);
                        // console.log(users)
                        return userObj ? (
                          <span key={index} className="d-flex align-items-center">
                            {userObj.name}
                            <button onClick={() => handleRemoveAssignedUser(task._id, userObj._id)}
                              className="btn btn-danger btn-sm mx-1">X</button>
                          </span>
                        ) : null;
                      })
                    ) : <span>No users assigned</span>}
                  </td>
                  <td>
                    {user ? (
                      <>
                        <Link to={`/taskedit/${task._id}`} className='bg-info btn'>Edit</Link>
                        <button className='btn bg-danger' onClick={() => handleDelete(task._id)}>Delete</button>
                        <button onClick={() => { setIsAssigning(true); setSelectedTaskId(task._id); setSelectedUsers([]); }} className='bg-primary btn'>Assign</button>
                      </>
                    ) : <td>Login to modify tasks</td>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isAssigning && (
          <div className="modal d-flex justify-content-center align-items-center mt-5 w-100">
            <div className="modal-content p-2 w-50">
              <span className="close btn bg-danger" onClick={() => setIsAssigning(false)}>X</span>
              <h2 className='text-center'>Assign Users to Task</h2>
              <select multiple value={selectedUsers} className='w-100' onChange={e => setSelectedUsers([...e.target.selectedOptions].map(option => option.value))}>
                {users.map(user => <option key={user._id} value={user._id}>{user.name}</option>)}
              </select>
              <button onClick={handleAssign} className="btn btn-primary mt-2 w-50">Assign</button>
            </div>
          </div>
        )}

        <GanttChart dataSource={ganttData} treeSize="30%" durationUnit="day" />
        <TaskStatistics />
      </div>
    );
  }

  export default ShowList;
