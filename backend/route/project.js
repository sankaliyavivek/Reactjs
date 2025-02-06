// routes/project.js
const express = require('express');
const ProjectSchema = require('../model/project');
const User = require('../model/user');  // Import the User model
const Notification = require('../model/notification');
const { Authentication } = require('../middleware/userAuth');
const { getIO } = require('../socket');  // Import socket instance

const router = express.Router();

// Create a new project
router.post('/create', Authentication, async (req, res) => {
    try {
        const { title, description, startDate, endDate, dueDate } = req.body;
        const project = new ProjectSchema({
            title,
            description,
            startDate,
            endDate,
            dueDate
        });
        await project.save();
        res.json({ message: "Project created successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating project" });
    }
});

// Get all projects
router.get('/get', async (req, res) => {
    try {
        const allData = await ProjectSchema.find();
        res.json({ message: 'Data fetched successfully', data: allData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching projects' });
    }
});

// Update project details
router.put('/update', async (req, res) => {
    try {
        const { id, title, description, startDate, endDate, dueDate } = req.body;
        const project = await ProjectSchema.findByIdAndUpdate(id, {
            title,
            description,
            startDate,
            endDate,
            dueDate,
        }, { new: true });

        // Create a new notification
        const notification = new Notification({
            message: `Project "${title}" has been updated.`,
            type: 'project',
            projectId: project._id
        });
        await notification.save();

        // Emit project update notification using Socket.IO
        const io = getIO();
        io.emit('projectUpdated', project);
        res.json({ message: "Project updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating project" });
    }
});

// Get project for editing
router.get('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await ProjectSchema.findById(id);
        res.json({ message: 'Project fetched for editing', project });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: 'Project not found' });
    }
});

// Delete project
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ProjectSchema.findByIdAndDelete(id);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: 'Project not found' });
    }
});




module.exports = router;
