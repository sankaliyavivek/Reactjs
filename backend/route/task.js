const express = require('express');
const TaskSchema = require('../model/task');
const router = express.Router();
const Notification = require('../model/notification');
const { Authentication, checkAdminRole } = require('../middleware/userAuth');
const User = require('../model/user');
const { getIO } = require('../socket');
const { updateTaskStatistics } = require('../utils/taskStatistics');

router.post('/taskcreate', Authentication, async (req, res) => {
    const { title, description, status, priority, assigneeId } = req.body;
    console.log(req.body)
    try {
        const task = new TaskSchema({
            title: title,
            description: description,
            status: status,
            priority: priority,
            assigneeId: assigneeId
        })
        await task.save();
        res.json({ message: "Task created successfully" });
    } catch (error) {
        console.error(error);
    }
});

// niche ni link  data show karva mate get method
router.get('/showtask', async (req, res) => {
    const TaskData = await TaskSchema.find();
    res.json({ message: "deta fetch successfully", data: TaskData });
})

router.put('/taskupdate', async (req, res) => {
    try {
        const { id, title, description, status, priority, projectId } = req.body;

        const task = await TaskSchema.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (title) task.title = title;
        if (description) task.description = description;
        if (status) task.status = status;
        if (priority) task.priority = priority;
        if (projectId) task.projectId = projectId; // Update projectId if provided

        await task.save();

        const notification = new Notification({
            message: `Task "${task.title}" has been updated.`,
            type: 'task',
            taskId: task._id
        });
        await notification.save();

        // Emit notification to frontend
        const io = getIO();
        io.emit('taskUpdated', notification);

        await updateTaskStatistics();

        res.json({ message: "Task updated successfully", task });
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/taskedit/:id', async (req, res) => {
    const { id } = req.params;
    const TaskData = await TaskSchema.findById(id);
    res.json({ message: "data fetch successfully", data: TaskData });
})
router.delete('/taskdelete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await TaskSchema.findByIdAndDelete(id);
        res.json({ message: "task deleted successfully" });
    } catch (error) {
        console.error(error);

    }
})
// In your backend route handler for assigning a user
// In your backend route handler for assigning a user
router.put('/assignTask/:taskId', Authentication,checkAdminRole, async (req, res) => {
    const { taskId } = req.params;
    const { userIds } = req.body;  // This is expected to be an array of user IDs

    // Check if userIds are provided and it's a non-empty array
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: 'No valid user IDs provided' });
    }

    // Fetch users based on the provided userIds
    const users = await User.find({ '_id': { $in: userIds } });
    if (users.length !== userIds.length) {
        return res.status(400).json({ message: 'Some user IDs are invalid' });
    }

    try {
        // Find the task by taskId
        const task = await TaskSchema.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        // Update the assigneeId field to include the new users
        task.assigneeId = [...new Set([...task.assigneeId, ...userIds])];

        // Save the updated task
        await task.save();
        // Create notification for task assignment
        const notification = new Notification({
            message: `Users have been assigned to task "${task.title}".`,
            type: 'task',
            taskId: task._id,
            usersAssigned: userIds
        });
        await notification.save();

        // Emit notification to frontend
        const io = getIO();
        io.emit('taskAssigned', {
                taskId,
                usersAssigned: userIds,
                message: `Users have been assigned to task "${task.title}".`
        });

        // Return the updated task in the response
        res.json({ message: 'Task assigned successfully', task });
    } catch (error) {
        console.error("Error assigning task:", error);
        res.status(500).json({ message: 'Error assigning task', error: error.message });
    }
});
router.delete('/unassignTask/:taskId/:userId', Authentication,checkAdminRole, async (req, res) => {
    const { taskId, userId } = req.params;
    try {
        const task = await TaskSchema.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.assigneeId = task.assigneeId.filter(id => id.toString() !== userId);
        await task.save();

        // Create notification for task unassignment
        const notification = new Notification({
            message: `User has been unassigned from task "${task.title}".`,
            type: 'task',
            taskId: task._id,
            userUnassigned: userId
        });
        await notification.save();

        // Emit notification to frontend
        const io = getIO();
        io.emit('taskUnassigned', {
            taskId,
            userId,
            tasktitle:task.title,
            message: `User has been unassigned from task "${task.title}".`

        });

        res.json({ message: 'User unassigned successfully', task });
    } catch (error) {
        console.error("Error unassigning user:", error);
        res.status(500).json({ message: 'Error unassigning user', error: error.message });
    }
});

router.get('/alluser', async (req, res) => {
    try {
        const allUser = await User.find();
        res.json({ message: 'all user fetch successfully', allUser });
    } catch (error) {
        console.error(error);
    }
})
module.exports = router;