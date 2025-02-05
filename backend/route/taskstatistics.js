const express = require('express');
const router = express.Router();
const Task = require('../model/task');

router.get('/task-statistics', async (req, res) => {
    try {
        const tasks = await Task.find();

        if (tasks.length === 0) {
            return res.json({ message: "No tasks available", data: {} });
        }

        // Task completion rate
        const completedTasks = tasks.filter(task => task.status === 'Completed').length;
        const taskCompletionRate = (completedTasks / tasks.length) * 100;

        // Task status distribution
        const statusCounts = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {});

        // Team productivity (assuming assigneeId is added to the schema)
        // const productivity = tasks.reduce((acc, task) => {
        //     if (task.assigneeId) {
        //         acc[task.assigneeId] = (acc[task.assigneeId] || 0) + 1;
        //     }
        //     return acc;
        // }, {});

        res.json({
            taskCompletionRate: taskCompletionRate.toFixed(2),
            statusDistribution: statusCounts,
            // teamProductivity: productivity
        });
    } catch (error) {
        console.error("Error fetching task statistics:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
