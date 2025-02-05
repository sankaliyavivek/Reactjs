// utils/taskStatistics.js
const TaskSchema = require('../model/task');
const { getIO } = require('../socket');

const updateTaskStatistics = async () => {
  try {
    const tasks = await TaskSchema.find();

    // Calculate the task completion rate
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const taskCompletionRate = (completedTasks / tasks.length) * 100;

    // Calculate task status distribution
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, { Backlog: 0, 'In Progress': 0, Completed: 0 });

    
    // Emit updated statistics to all clients
    const io = getIO();
    io.emit('updateStatistics', {
      taskCompletionRate: taskCompletionRate.toFixed(2),
      statusDistribution: statusCounts,
    //   teamProductivity: productivity,
    });
  } catch (error) {
    console.error('Error calculating task statistics:', error);
  }
};

module.exports = { updateTaskStatistics };
