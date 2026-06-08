# Smart E-Learning Server

A RESTful API backend for an e-learning platform built with **Node.js**, **Express**, and **MongoDB**. Supports user authentication with role-based access control, course management with lesson-based content, and student enrollment workflows.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB + Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs
- **Middleware:** cors, morgan (logging), dotenv
- **Dev Tools:** nodemon

## Features

- **User Authentication** — Register, login, and JWT-based protected routes
- **Role-Based Access Control** — Three roles: `student`, `instructor`, `admin`
- **Admin Dashboard** — List all users, update user roles, delete users
- **Course Management** — Full CRUD for courses with lesson-based content
- **Content Access Control** — Lessons locked behind enrollment; only enrolled students, instructors, and admins can view full content
- **Course Enrollment** — Students can enroll/unenroll with duplicate-prevention
- **Enrollment Status** — Check if a student is enrolled in a specific course
- **Instructor Analytics** — View all students enrolled in a specific course
- **Filtering, Search & Pagination** — Courses can be filtered by keyword, category, or instructor with paginated results
- **Error Handling** — Centralized error handler and 404 middleware

## Database Models

### User
| Field    | Type   | Description                          |
|----------|--------|--------------------------------------|
| name     | String | Full name (required)                 |
| email    | String | Unique email (required)              |
| password | String | Hashed password (required)           |
| role     | String | `student`, `instructor`, or `admin`  |
| timestamps | Date | Created at / Updated at            |

### Course
| Field      | Type     | Description                              |
|------------|----------|------------------------------------------|
| title      | String   | Course title (required)                  |
| description| String   | Course description                       |
| price      | Number   | Defaults to 0                            |
| category   | String   | Course category                          |
| thumbnail  | String   | Thumbnail image URL                      |
| lessons    | [Object] | Array of `{ title, content, videoUrl }`  |
| instructor | ObjectId | Reference to User (instructor)           |
| timestamps | Date     | Created at / Updated at                  |

### Enrollment
| Field      | Type     | Description                           |
|------------|----------|---------------------------------------|
| user       | ObjectId | Reference to User (student)           |
| course     | ObjectId | Reference to Course                   |
| timestamps | Date     | Created at / Updated at               |

- Unique compound index on `{ user, course }` to prevent duplicate enrollments.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (running locally on default port 27017, or a remote Atlas URI)

### Installation

```bash
git clone https://github.com/eyademad1/smart-e-learning-api.git
cd smart-e-learning-api
npm install
```

### Environment Variables

Create a `.env` file in the root:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Run

```bash
# Development (with auto-reload via nodemon)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:5000`.

## API Endpoints

### Health Check

| Method | Endpoint | Description          |
|--------|----------|----------------------|
| GET    | `/`      | Welcome / health check |

### Authentication (`/api/auth`)

| Method | Endpoint              | Auth | Roles   | Description                        |
|--------|-----------------------|------|---------|------------------------------------|
| POST   | `/api/auth/register`  | —    | —       | Register (name, email, password)   |
| POST   | `/api/auth/login`     | —    | —       | Login (email, password)            |
| GET    | `/api/auth/profile`   | ✅   | Any     | Get current user profile           |
| GET    | `/api/auth/admin`     | ✅   | admin   | Admin-only dashboard               |
| GET    | `/api/auth/users`     | ✅   | admin   | List all users                     |
| PUT    | `/api/auth/users/:id/role` | ✅ | admin | Update a user's role              |
| DELETE | `/api/auth/users/:id` | ✅   | admin   | Delete a user                      |

### Courses (`/api/courses`)

| Method | Endpoint           | Auth | Roles                | Description                             |
|--------|--------------------|------|----------------------|-----------------------------------------|
| GET    | `/api/courses`     | —    | —                    | List courses (`?keyword=&category=&instructor=&page=&limit=`) |
| GET    | `/api/courses/:id` | —    | —                    | Get single course (lessons locked if not enrolled) |
| POST   | `/api/courses`     | ✅   | instructor, admin    | Create a course                         |
| PUT    | `/api/courses/:id` | ✅   | Owner or admin       | Update a course                         |
| DELETE | `/api/courses/:id` | ✅   | Owner or admin       | Delete a course                         |

### Enrollments (`/api/enrollments`)

| Method | Endpoint                          | Auth | Roles                | Description                              |
|--------|-----------------------------------|------|----------------------|------------------------------------------|
| POST   | `/api/enrollments/:courseId`      | ✅   | student              | Enroll in a course                       |
| GET    | `/api/enrollments/my-courses`     | ✅   | Any                  | Get logged-in user's enrolled courses     |
| GET    | `/api/enrollments/status/:courseId` | ✅ | student              | Check if enrolled in a specific course   |
| GET    | `/api/enrollments/course/:courseId` | ✅ | instructor, admin   | Get all students enrolled in a course    |

## Authentication Flow

1. **Register** or **Login** to receive a JWT token.
2. Include the token in subsequent requests as an `Authorization: Bearer <token>` header.
3. Tokens expire after 7 days.
4. Protected routes return `401` if no valid token is provided.
5. Role-restricted routes return `403` if the user's role is not authorized.

## Content Access Control

When fetching a single course (`GET /api/courses/:id`):

- **Unauthenticated users** or **unenrolled students** see lesson titles only (content and videoUrl are masked).
- **Enrolled students**, the **course instructor**, and **admins** see full lesson content.
- Course list (`GET /api/courses`) always excludes lesson details.

## Project Structure

```
├── app.js                  # Express app setup
├── server.js               # Entry point — connects DB and starts server
├── config/
│   └── db.js               # MongoDB connection
├── controllers/
│   ├── auth.controller.js  # Register, login, user management
│   ├── course.controller.js# Course CRUD with access control
│   └── enrollment.controller.js # Enrollment logic
├── middleware/
│   ├── auth.middleware.js   # JWT verification
│   ├── role.middleware.js   # Role-based authorization
│   ├── errorHandler.js     # Centralized error handler
│   └── notFound.js         # 404 handler
├── models/
│   ├── User.js             # User schema
│   ├── Course.js           # Course schema with lessons
│   └── Enrollment.js       # Enrollment schema
├── routes/
│   ├── auth.routes.js      # Auth & admin user management routes
│   ├── course.routes.js    # Course routes
│   └── enrollment.routes.js# Enrollment routes
└── utils/
    ├── hash.js             # bcrypt password hashing
    └── generateToken.js    # JWT token generation
```
