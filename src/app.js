const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const os = require('os');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Be more specific in production
  },
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io connection for terminal
io.on('connection', (socket) => {
  console.log('A user connected to the terminal.');

  // Determine the shell based on the OS
  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

  // Spawn a new pty process
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
  });

  console.log(`PTY process created with PID: ${ptyProcess.pid}`);

  // Pipe data from pty to socket
  ptyProcess.on('data', function (data) {
    socket.emit('terminal:data', data);
  });

  // Pipe data from socket to pty
  socket.on('terminal:write', function (data) {
    ptyProcess.write(data);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected from the terminal.');
    ptyProcess.kill();
  });
});

// Basic Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the API' });
});

// Terminal Route
app.get('/terminal', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terminal.html'));
});

// 404 Error Handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Global Error Handler
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
