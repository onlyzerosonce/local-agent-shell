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

// Determine the shell based on the OS
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

// Spawn a single pty process for the entire application
const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env,
});
console.log(`PTY process created with PID: ${ptyProcess.pid}`);

// Pipe PTY output to all connected sockets
ptyProcess.on('data', function (data) {
  io.emit('terminal:data', data);
});

// Socket.io connection for terminal
io.on('connection', (socket) => {
  console.log('A user connected to the terminal.');

  // Handle incoming data from the client
  socket.on('terminal:write', function (data) {
    console.log('Input from user: ', data);
    ptyProcess.write(data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from the terminal.');
  });
});

// API endpoint to execute commands
app.post('/api/exec', (req, res) => {
  const { command } = req.body;
  if (command) {
    console.log('Input from automation: ', command);
    // Add a newline character to execute the command
    ptyProcess.write(command + '\n');
    res.status(200).send({ message: 'Command executed' });
  } else {
    res.status(400).send({ message: 'Command not provided' });
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
