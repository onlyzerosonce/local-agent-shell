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
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://cdn.jsdelivr.net"],
        "script-src-elem": ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
      },
    },
  })
);
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// --- Terminal Management ---

// This map will store the pseudo-terminal (pty) process for each connected socket.
const ptyProcesses = new Map();

// --- Socket.io Connection Handling ---

io.on('connection', (socket) => {
  console.log(`A user connected with socket ID: ${socket.id}`);

  // Determine the shell based on the OS.
  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

  // Spawn a new pty process for this socket connection.
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  // Store the pty process for this socket.
  ptyProcesses.set(socket.id, ptyProcess);
  console.log(`PTY process created for socket ${socket.id} with PID: ${ptyProcess.pid}`);


  // Pipe the output of the pty process to the corresponding socket client.
  ptyProcess.on('data', function (data) {
    socket.emit('terminal:data', data);
  });

  // Handle data sent from the client terminal.
  socket.on('terminal:write', function (message) {
    if (typeof message === 'object' && message.source === 'automation') {
      // Input from automation
      console.log(`Input from automation (socket ${socket.id}): `, message.data);
      ptyProcess.write(message.data);
    } else {
      // Input from user typing
      console.log(`Input from user (socket ${socket.id}): `, message);
      ptyProcess.write(message);
    }
  });

  // Clean up when the user disconnects.
  socket.on('disconnect', () => {
    console.log(`User with socket ID: ${socket.id} disconnected.`);
    // Kill the pty process associated with this socket.
    ptyProcess.kill();
    // Remove the pty process from the map.
    ptyProcesses.delete(socket.id);
    console.log(`PTY process for socket ${socket.id} killed.`);
  });
});

// --- API Endpoints ---

/**
 * @api {post} /api/exec Execute a command in a specific terminal session
 * @apiName ExecuteCommand
 * @apiGroup Automation
 *
 * @apiParam {String} command The command to execute.
 * @apiParam {String} socketId The ID of the socket/terminal session to execute the command in.
 *
 * @apiSuccess {Object} message Confirmation message.
 * @apiError   {Object} message Error message.
 */
app.post('/api/exec', (req, res) => {
  const { command, socketId } = req.body;

  if (!command || !socketId) {
    return res.status(400).send({ message: 'Request body must include "command" and "socketId".' });
  }

  const ptyProcess = ptyProcesses.get(socketId);
  if (ptyProcess) {
    console.log(`Executing command for socket ${socketId}: ${command}`);
    ptyProcess.write(command + '\n');
    res.status(200).send({ message: `Command '${command}' executed in session ${socketId}.` });
  } else {
    res.status(404).send({ message: `No active terminal session found for socketId: ${socketId}` });
  }
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
