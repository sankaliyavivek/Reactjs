
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NewProjectForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    const validateForm = () => {
        let tempErrors = {};
        if (!title.trim()) tempErrors.title = "Project title is required.";
        if (!description.trim()) tempErrors.description = "Project description is required.";
        if (!startDate) tempErrors.startDate = "Start date is required.";
        if (!endDate) tempErrors.endDate = "End date is required.";
        if (!dueDate) tempErrors.dueDate = "Due date is required.";
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            tempErrors.date = "End date must be after start date.";
        }
        if (dueDate && endDate && new Date(dueDate) < new Date(endDate)) {
            tempErrors.dueDate = "Due date must be after the end date.";
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0; // Returns true if no errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const create = await axios.post('http://localhost:8000/project/create', {
                    title, description, startDate, endDate, dueDate
                }, { withCredentials: true }
                );

                console.log(create);
                alert("Project created successfully");
                navigate('/');

            } catch (error) {
                alert('Login First')
                console.error(error);
            }
            console.log("Form submitted:", { title, description, startDate, endDate });
        }
    };

    return (
        <div className="container">
            <div className="text-center mb-4">
                <h1>Create New Project</h1>
            </div>

            <div className="d-flex justify-content-center">
                <form className="w-50" onSubmit={handleSubmit}>
                    {/* Title Input */}
                    <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter project title"
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
                            placeholder="Enter project description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        {errors.description && <p className="text-danger">{errors.description}</p>}
                    </div>

                    {/* Start Date Input */}
                    <div className='d-flex justify-content-evenly gap-2'>
                        <div className="mb-3 w-50">
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            {errors.startDate && <p className="text-danger">{errors.startDate}</p>}
                        </div>

                        {/* End Date Input */}
                        <div className="mb-3 w-50">
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            {errors.endDate && <p className="text-danger">{errors.endDate}</p>}
                        </div>

                    </div>
                    {/* Date Validation Error */}
                    {errors.date && <p className="text-danger">{errors.date}</p>}

                    <div className="mb-3">
                        <label className="form-label">Due Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                        {errors.dueDate && <p className="text-danger">{errors.dueDate}</p>}
                    </div>

                    {/* Date Validation Error */}
                    {errors.date && <p className="text-danger">{errors.date}</p>}

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary w-100">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}

export default NewProjectForm;
