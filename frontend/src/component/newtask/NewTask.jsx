
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NewTask() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium'); // Default priority
  const [status, setStatus] = useState('Backlog'); // Default status
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');

  const navigate = useNavigate();

  const validateForm = () => {
    let tempErrors = {};
    if (!title.trim()) tempErrors.title = 'Task title is required.';
    if (!description.trim()) tempErrors.description = 'Task description is required.';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post(
          'http://localhost:8000/task/taskcreate',
          {
            title,
            description,
            status,
            priority,
          },
          { withCredentials: true }
        );

        alert('Task successfully created!');
        console.log(response.data);
       navigate('/alltask')
      } catch (error) {
        console.error(error);
        setBackendError(error.response?.data?.message || 'An error occurred.');
      }
    }
  };

  return (
    <div className="container">
      <div className="text-center mb-4">
        <h1>Create New Task</h1>
      </div>

      <div className="d-flex justify-content-center">
        <form className="w-50" onSubmit={handleTaskSubmit}>
          {/* Title Input */}
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <p className="text-danger">{errors.title}</p>}
          </div>

          {/* Description Input */}
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              placeholder="Enter task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && <p className="text-danger">{errors.description}</p>}
          </div>

          {/* Status & Priority */}
          <div className="mb-3 d-flex gap-3">
            <div>
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Backlog">Backlog</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Backend Error Message */}
          {backendError && <p className="text-danger">{backendError}</p>}

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-100">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewTask;

