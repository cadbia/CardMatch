# CardMatch - Credit Card Recommendation Application

CardMatch is a full-stack MERN (MongoDB, Express, React, Node.js) application that helps users find the perfect credit card based on their preferences and spending habits.

## Table of Contents

- [Project Overview](#project-overview)
- [File Structure](#file-structure)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building for Production](#building-for-production)
- [API Documentation](#api-documentation)

## Project Overview

CardMatch is designed to simplify the process of finding the right credit card. The application uses a smart matching algorithm to recommend cards based on user preferences and spending patterns.

Key features:
- User authentication (login/signup)
- Dashboard with personalized card recommendations
- Responsive design for all device sizes
- RESTful API for card data and user management

## File Structure

```
card-match/
├── server/                # Backend code
│   ├── controllers/       # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── data/              # Seed data
│   └── index.js           # Server entry point
├── src/                   # Frontend code
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API client and services
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   ├── index.css          # Global styles
│   └── main.tsx           # Frontend entry point
├── .env                   # Environment variables
├── package.json           # Project dependencies and scripts
├── vite.config.ts         # Vite configuration
└── README.md              # Project documentation
```

## Technologies Used

### Frontend
- React with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- Vite for development and building

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/card-match.git
   cd card-match
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=5000
     NODE_ENV=development
     MONGODB_URI=mongodb://localhost:27017/cardmatch
     JWT_SECRET=your_jwt_secret_key_change_in_production
     JWT_EXPIRES_IN=7d
     ```

4. Seed the database:
   ```bash
   node server/data/seed.js
   ```

5. Start the development servers:
   ```bash
   npm run dev:full
   ```

6. Open your browser and navigate to `http://localhost:5173`

## Development

### Available Scripts

- `npm run dev`: Start the frontend development server
- `npm run server`: Start the backend server
- `npm run dev:server`: Start the backend server with nodemon (auto-restart)
- `npm run dev:full`: Start both frontend and backend servers concurrently
- `npm run build`: Build the frontend for production
- `npm run lint`: Run ESLint to check for code issues

## Building for Production

To build the application for production:

```bash
npm run build
```

This will create a `dist` directory with the optimized frontend build. The backend can be started with:

```bash
npm run server
```

In production, the Express server will serve the static frontend files from the `dist` directory.

## API Documentation

### Authentication

- `POST /api/auth/register`: Register a new user
  - Body: `{ name, email, password }`
  - Returns: User object and JWT token

- `POST /api/auth/login`: Login
  - Body: `{ email, password }`
  - Returns: User object and JWT token

- `GET /api/auth/me`: Get current user
  - Headers: `Authorization: Bearer <token>`
  - Returns: User object

### Cards

- `GET /api/cards`: Get all cards
  - Returns: Array of card objects

- `GET /api/cards/:id`: Get a specific card
  - Returns: Card object

- `GET /api/cards/recommendations`: Get personalized card recommendations
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of card objects with match scores

### Users

- `PUT /api/users/profile`: Update user profile
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name, email }`
  - Returns: Updated user object

- `PUT /api/users/preferences`: Update user preferences
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ categories, annualFeePreference, creditScoreRange }`
  - Returns: Updated preferences object