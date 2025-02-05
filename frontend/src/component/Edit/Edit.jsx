import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function Edit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:8000/project/edit/${id}`)
            .then(response => {
                setTitle(response.data.project.title);
                setDescription(response.data.project.description);
                setStartDate(response.data.project.startDate);
                setEndDate(response.data.project.endDate);
                setDueDate(response.data.project.dueDate);
            })
            .catch(error => {
                setError(error.response?.data?.message || "Failed to fetch project");
            });
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();  
        if (new Date(dueDate) < new Date(endDate)) {
            setError("Due date must be after the end date.");
            return;
        }
        try {
            await axios.put(`http://localhost:8000/project/update`, {
                id,
                title,
                description,
                startDate,
                endDate,
                dueDate
            });
            alert("Project updated successfully");
            navigate('/');
        } catch (error) {
            console.error("Error updating project:", error);
            setError(error.response?.data?.message || "Failed to update project");
        }
    };

    return (
        <div className="container">
            <div className="text-center mb-4">
                <h1>Edit Project</h1>
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

                    <div className="mb-3">
                        <label className="form-label">Start Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">End Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Due Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary w-100">
                        Update Project
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Edit;
