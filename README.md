# 🎥 ZYX Video Conferencing Platform

A modern, full-stack video conferencing application built with React, Node.js, and Socket.io. Connect, communicate, and collaborate in real-time with an intuitive and responsive interface.

![JavaScript](https://img.shields.io/badge/JavaScript-91.4%25-yellow)
![CSS](https://img.shields.io/badge/CSS-8.1%25-blue)
![HTML](https://img.shields.io/badge/HTML-0.5%25-orange)

## ✨ Features

- **Real-time Video Conferencing** - Crystal clear peer-to-peer video communication
- **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- **Room Management** - Create, join, and manage video conference rooms
- **Responsive Design** - Works seamlessly across desktop and mobile devices
- **Material Design UI** - Modern and intuitive user interface using Material-UI
- **Real-time Communication** - Socket.io for instant messaging and room updates
- **Secure Session Management** - Cookie-based session handling
- **Database Integration** - MongoDB for persistent data storage

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Lightning-fast build tool
- **Material-UI (MUI)** - Component library with Material Design
- **Socket.io Client** - Real-time bidirectional communication
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Emotion** - CSS-in-JS styling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB & Mongoose** - Database and ODM
- **Socket.io** - Real-time communication server
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - Cookie handling middleware

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB instance (local or cloud)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Pritam688Pal/ZYX-Video-Conferencing-Platform.git
cd ZYX-Video-Conferencing-Platform
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
echo "MONGODB_URI=your_mongodb_connection_string" > .env
echo "JWT_SECRET=your_secret_key" >> .env

# Start the server
npm run dev    # Development mode with nodemon
# or
npm start      # Production mode
```

The backend will run on `http://localhost:3000` (or your configured port).

#### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file for frontend configuration
echo "VITE_API_URL=http://localhost:3000" > .env

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173` (default Vite port).

## 📝 Available Scripts

### Backend
- `npm start` - Run the production server
- `npm run dev` - Run the development server with auto-reload

### Frontend
- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🏗️ Project Structure

```
ZYX-Video-Conferencing-Platform/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express server configuration
│   │   ├── routes/             # API routes
│   │   ├── models/             # Mongoose schemas
│   │   ├── middleware/         # Custom middleware
│   │   └── controllers/        # Route controllers
│   ├── package.json
│   └── .env                    # Environment variables (create this)
│
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── .env                    # Environment variables (create this)
│
└── README.md
```

## 🔐 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Room Endpoints
- `GET /api/rooms` - Get all available rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:id` - Get specific room details
- `DELETE /api/rooms/:id` - Delete a room

### WebSocket Events
- `join-room` - User joins a video conference room
- `leave-room` - User leaves the conference
- `send-message` - Send chat message in conference
- `user-connected` - Broadcast when user connects
- `user-disconnected` - Broadcast when user disconnects

## 💡 Usage

1. **Open** the application in your browser at `http://localhost:5173`
2. **Register** a new account or login if you already have one
3. **Create or Join** a video conference room
4. **Share** the room ID with others to invite them
5. **Start** your video conference and communicate in real-time

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👨‍💻 Author

**Pritam Pal**
- GitHub: [@Pritam688Pal](https://github.com/Pritam688Pal)
