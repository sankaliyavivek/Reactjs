const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    type: { type: String, enum: ['project', 'task'], required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false }, // Set to false to make it optional
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: false },
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', NotificationSchema);
