# Local Agent Shell

A browser-based file system explorer and shell interface powered by autonomous agent technology. This project enables secure local file management and command execution through a web interface, designed for developers who need programmatic file system access with agent automation capabilities.

## Project Goals

### Primary Objectives
- **Secure File System Access**: Provide controlled access to local files and directories through a web-based interface
- **Shell Integration**: Enable command-line operations within a browser environment with safety guardrails
- **Agent Automation**: Support autonomous agent workflows for file management, code execution, and system operations
- **Developer Productivity**: Streamline development workflows by combining file browsing, editing, and shell operations in one interface

### Secondary Goals
- **Cross-Platform Compatibility**: Work seamlessly across different operating systems (Windows, macOS, Linux)
- **Security First**: Implement robust security measures to prevent unauthorized access and malicious operations
- **Extensible Architecture**: Design modular components that can be extended with additional functionality
- **Real-time Collaboration**: Enable multiple users to work on the same file system safely (future enhancement)

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Browser Frontend                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │   File Explorer │  │ Terminal UI  │  │  Code Editor    │ │
│  │                 │  │              │  │                 │ │
│  └─────────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                    WebSocket/HTTP API
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Backend Server (Node.js)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  File System    │  │ Shell Manager│  │ Security Layer  │ │
│  │    Handler      │  │              │  │                 │ │
│  └─────────────────┘  └──────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Agent Interface │  │ Process Mgmt │  │   Logging       │ │
│  │                 │  │              │  │                 │ │
│  └─────────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                    System Interface
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Local Operating System                   │
├─────────────────────────────────────────────────────────────┤
│     File System     │     Shell/Terminal     │   Processes  │
└─────────────────────────────────────────────────────────────┘
```

### Core Modules

#### 1. Frontend Interface
- **File Explorer**: Tree-view navigation of the local file system
- **Terminal Emulator**: Browser-based terminal with command history and auto-completion
- **Code Editor**: Syntax-highlighted editor for viewing and modifying files
- **Agent Dashboard**: Interface for monitoring and controlling agent operations

#### 2. Backend Services
- **File System API**: RESTful endpoints for file operations (read, write, delete, move, copy)
- **Shell Proxy**: Secure wrapper around system shell with command filtering and logging
- **Agent Engine**: Core logic for autonomous operations and workflow execution
- **Security Manager**: Authentication, authorization, and command validation

#### 3. Security Layer
- **Sandboxing**: Restrict file system access to designated safe directories
- **Command Whitelist**: Allow only approved shell commands and parameters
- **Session Management**: Secure user sessions with timeout and activity monitoring
- **Audit Trail**: Comprehensive logging of all file and shell operations

### Technology Stack

#### Frontend
- **Framework**: React.js with TypeScript for type safety
- **Terminal**: Xterm.js for terminal emulation
- **Editor**: Monaco Editor (VS Code editor component)
- **UI Library**: Material-UI or Chakra UI for consistent design
- **State Management**: Redux Toolkit for application state

#### Backend
- **Runtime**: Node.js with Express.js framework
- **WebSockets**: Socket.io for real-time communication
- **File Operations**: Native fs modules with additional security wrappers
- **Process Management**: child_process module with security constraints
- **Database**: SQLite for session management and audit logs

#### Development & Deployment
- **Build Tool**: Vite for fast development and optimized production builds
- **Testing**: Jest for unit tests, Playwright for end-to-end testing
- **Containerization**: Docker for consistent deployment environments
- **CI/CD**: GitHub Actions for automated testing and deployment

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/onlyzerosonce/local-agent-shell.git
cd local-agent-shell

# Install dependencies
npm install

# Set up environment configuration
cp .env.example .env
# Edit .env to configure your settings

# Start development server
npm run dev
```

### Configuration

Key configuration options in `.env`:
- `ALLOWED_DIRECTORIES`: Comma-separated list of safe directories
- `SHELL_WHITELIST`: Approved shell commands (default: basic file operations)
- `SESSION_TIMEOUT`: Session timeout in minutes (default: 30)
- `LOG_LEVEL`: Logging verbosity (debug, info, warn, error)

## Usage Examples

### File Operations
```javascript
// Navigate to directory
await fileAPI.changeDirectory('/path/to/directory');

// List files with metadata
const files = await fileAPI.listFiles({ includeHidden: false });

// Read file content
const content = await fileAPI.readFile('example.txt');

// Write file
await fileAPI.writeFile('output.txt', 'Hello, World!');
```

### Shell Commands
```javascript
// Execute safe command
const result = await shellAPI.execute('ls -la');

// Run with working directory
const output = await shellAPI.execute('npm install', { cwd: '/project/path' });
```

### Agent Integration
```javascript
// Define agent task
const task = {
  name: 'analyze-project',
  steps: [
    { action: 'scanDirectory', path: '/project' },
    { action: 'analyzeFiles', pattern: '*.js' },
    { action: 'generateReport', format: 'markdown' }
  ]
};

// Execute agent workflow
const report = await agentAPI.executeTask(task);
```

## Security Considerations

- All file operations are restricted to pre-configured safe directories
- Shell commands are filtered through a whitelist of approved operations
- User sessions are encrypted and automatically expire
- All operations are logged for security auditing
- Rate limiting prevents abuse and resource exhaustion

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] Core file system interface
- [ ] Basic shell integration
- [ ] Security framework implementation
- [ ] Agent automation engine
- [ ] Real-time collaborative features
- [ ] Plugin system for extensibility
- [ ] Mobile-responsive design
- [ ] Advanced debugging tools
