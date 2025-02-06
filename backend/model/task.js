const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Backlog', 'In Progress', 'Completed'],
    default: 'Backlog'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  
  assigneeId:[ { type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
