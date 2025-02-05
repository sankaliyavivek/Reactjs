const socketIo = require('socket.io');

let io;  // Declare the io instance

// Initialize Socket.IO with the HTTP server
const initializeSocket = (server) => {
  if (io) {
    console.log('Socket.IO is already initialized');
    return;
  }

  // Initialize Socket.IO
  io = socketIo(server, {
    cors: {
      origin: 'http://localhost:5173',  // Frontend origin
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true,
    },
  });

  console.log('Socket.IO initialized');

  // Handle Socket.IO events
  io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for task updates
    socket.on('updateTask', (taskData) => {
      io.emit('taskUpdated', taskData);
      console.log(taskData)  // Emit the task update to all connected clients
    });

    // Listen for project updates
    socket.on('updateProject', (projectData) => {
      io.emit('projectUpdated', projectData);
      console.log(projectData)  // Emit the project update to all connected clients
    });

      // Listen for task statistics updates (e.g., after task completion)
      socket.on('updateTaskStatistics', (statisticsData) => {
        io.emit('taskStatisticsUpdated', statisticsData);
        console.log('Task statistics updated:', statisticsData);  // Emit task statistics updates to all connected clients
      });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};

// Get the current Socket.IO instance (to use in other parts of the app)
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
