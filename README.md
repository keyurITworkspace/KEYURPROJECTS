# SkillSwap - Skill Exchange Platform

A modern, full-stack web application that enables users to list their skills and request others in return, facilitating skill exchanges and learning opportunities within a community.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure registration and login system with JWT tokens
- **Skill Management**: Users can add, edit, and delete their skills
- **Skill Discovery**: Browse and search available skills from other users
- **Skill Requests**: Request skills from other users and offer skills in return
- **Request Management**: Accept, reject, or complete skill exchange requests
- **User Profiles**: Comprehensive user profiles with bio, location, and contact info

### User Experience
- **Modern UI**: Clean, responsive design built with Tailwind CSS
- **Real-time Updates**: Dynamic content updates without page refreshes
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Easy-to-use interface with clear navigation

### Technical Features
- **Full-stack Architecture**: React frontend with Node.js/Express backend
- **Database**: SQLite for lightweight, local data storage
- **Type Safety**: TypeScript for better development experience
- **Authentication**: JWT-based authentication system
- **API Design**: RESTful API with proper error handling
- **Security**: Password hashing, input validation, and SQL injection prevention

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite3** - Lightweight database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
skill-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── types.ts        # TypeScript types
│   │   ├── api.ts          # API service layer
│   │   └── index.tsx       # App entry point
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── database.js         # Database setup
│   ├── index.js            # Server entry point
│   ├── package.json
│   └── .env               # Environment variables
├── package.json           # Root package.json
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Step 1: Clone the repository
```bash
git clone <repository-url>
cd skill-platform
```

### Step 2: Install dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (client and server)
npm run install-all
```

### Step 3: Environment Setup
The server comes with a default `.env` file. For production, update the JWT secret:

```bash
# server/.env
PORT=5000
JWT_SECRET=your-secure-secret-key-here
NODE_ENV=development
```

### Step 4: Start the application
```bash
# Start both frontend and backend
npm run dev
```

Or start them separately:
```bash
# Start backend (in one terminal)
npm run server

# Start frontend (in another terminal)
npm run client
```

### Step 5: Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🎯 Usage Guide

### Getting Started
1. **Register**: Create a new account with username, email, and password
2. **Login**: Sign in with your credentials
3. **Add Skills**: Navigate to "My Skills" and add your skills
4. **Browse Skills**: Visit "Browse Skills" to see available skills
5. **Request Skills**: Click "Request" on skills you're interested in
6. **Manage Requests**: Check "Requests" to handle incoming and outgoing requests

### Key Features

#### Skill Management
- Add skills with name, description, proficiency level, and category
- Edit existing skills and toggle availability
- Delete skills you no longer want to offer

#### Skill Discovery
- Search skills by name or description
- Filter by categories
- View skill details including user information

#### Request System
- Send skill requests with your offered skill and personal message
- Accept or reject incoming requests
- Track sent requests and their status

#### Profile Management
- Update your profile information
- Add bio and location
- View your account statistics

## 🔒 Security Features

- **Password Security**: Passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation of all inputs
- **SQL Injection Prevention**: Parameterized queries
- **CORS Protection**: Configured cross-origin resource sharing

## 🎨 Design Principles

- **User-Centered Design**: Focus on user experience and ease of use
- **Responsive Design**: Works on all device sizes
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Optimized loading and rendering
- **Modern UI**: Clean, professional appearance

## 📊 Database Schema

### Users Table
- id, username, email, password_hash, full_name, bio, location, created_at

### Skills Table
- id, user_id, skill_name, description, proficiency_level, category, available, created_at

### Skill Requests Table
- id, requester_id, skill_owner_id, skill_id, requested_skill, offered_skill, message, status, created_at, updated_at

### Exchanges Table
- id, request_id, user1_id, user2_id, user1_skill, user2_skill, ratings, completed_at

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Skills
- `GET /api/skills` - Get all available skills
- `GET /api/skills/my` - Get current user's skills
- `POST /api/skills` - Create new skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

### Requests
- `GET /api/requests/received` - Get received requests
- `GET /api/requests/sent` - Get sent requests
- `POST /api/requests` - Create skill request
- `PUT /api/requests/:id/status` - Update request status

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## 🔧 Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Testing
```bash
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Known Issues

- None at this time

## 🔮 Future Enhancements

- Real-time messaging between users
- Skill rating and review system
- Advanced search filters
- User verification system
- Mobile app version
- Email notifications
- Skill categories management
- Advanced analytics dashboard

## 💬 Support

For support, please create an issue in the repository or contact the development team.

---

Built with ❤️ by the SkillSwap Team