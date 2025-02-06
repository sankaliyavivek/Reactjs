import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';


function TaskEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [projectId, setProjectId] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:8000/task/taskedit/${id}`)
            .then(response => {
                setTitle(response.data.data.title);
                setDescription(response.data.data.description);
                setStatus(response.data.data.status);
                setPriority(response.data.data.priority);
                setProjectId(response.data.data.projectId);
                // console.log(response.data)
            })
            .catch(error => {
                setError(error.response?.data?.message || "Failed to fetch project");
            });
    }, [id]);

    const handleUpdate = async(e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8000/task/taskupdate`,{
                id,
                title,
                description,
                status,
                priority,
                projectId: projectId, 
            });
            alert("Task updated successfully");
            navigate('/alltask');
        } catch (error) {
            console.error("Error updating Task:", error);
            setError(error.response?.data?.message || "Failed to update Task");
        }
    };
    return (
        <div>

            <div className="container">
                <div className="text-center mb-4">
                    <h1>Update Task Management Project</h1>
                </div>

                <div className="d-flex justify-content-center">
                    <form className="w-50" onSubmit={handleUpdate}>

                        {error && <p className="text-danger text-center">{error}</p>}
                        <div className="mb-3">
                            <label className="form-label">Title</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter project title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                placeholder="Enter project description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>


                        <div className="mb-3 d-flex gap-3">
                            <div>
                                <label className="form-label">Status</label><br></br>
                                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="Backlog">Backlog</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>

                                </select>
                            </div>

                            <div>
                                <label className="form-label">Priority</label><br></br>
                                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                        </div>

                        <button type="submit" className="btn btn-primary w-100">
                            Update Project
                        </button>
                    </form>
                </div>
            </div>

        </div>
    )
}

export default TaskEdit
