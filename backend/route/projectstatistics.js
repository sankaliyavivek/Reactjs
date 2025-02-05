const express = require('express');
const router = express.Router();
const Project = require('../model/project');

// Get project statistics based on startDate and dueDate
router.get('/project-stats', async (req, res) => {
    try {
        const totalProjects = await Project.countDocuments();

        // Get the current date
        const today = new Date();

        // Count projects that have started (startDate is today or earlier)
        const startedProjects = await Project.countDocuments({
            startDate: { $lte: today }
        });

        // Count overdue projects (dueDate is before today)
        const overdueProjects = await Project.countDocuments({
            dueDate: { $lt: today }
        });

        res.json({
            totalProjects,
            startedProjects,
            overdueProjects
        });
    } catch (error) {
        console.error("Error fetching project statistics:", error);
        res.status(500).json({ message: "Error fetching project statistics" });
    }
});

module.exports = router;
