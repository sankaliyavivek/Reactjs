


const express = require('express');
const http = require('http');
const { initializeSocket } = require('./socket');
const app = express();

// Create HTTP server and initialize socket.io
const httpServer = http.createServer(app);
initializeSocket(httpServer); // Initialize socket server

require('./connect');  // MongoDB connection

const { sendDeadlineReminders } = require('./cronReminder/emailsheduler');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const port = 8000;

app.use(cors({
  origin: 'http://localhost:5173',  // Frontend origin
  credentials: true,
}));

// sendDeadlineReminders();
app.use(cookieParser());
app.use(express.json());
// 
const router = require('./route/user');
const project = require('./route/project');
const task = require('./route/task');
const notification =require('./route/notification');
const statistics = require('./route/projectstatistics')
const taskstatistics = require('./route/taskstatistics');

app.use('/user', router);
app.use('/project', project);
app.use('/task', task);
app.use('/notification',notification);
app.use('/statistics',statistics);
app.use('/statisticss', taskstatistics);

// Listen on the HTTP server
httpServer.listen(port, () => {
  console.log(`Server is started at http://localhost:${port}`);
});
