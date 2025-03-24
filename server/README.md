# CardMatch Backend Documentation

## Overview

The CardMatch backend is built with Node.js, Express, and MongoDB, providing a robust API for credit card recommendations and user management. This document covers everything you need to know about the backend architecture, development, and deployment.

## Table of Contents

- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Development Guidelines](#development-guidelines)
- [Testing](#testing)
- [Deployment](#deployment)
- [Resources](#resources)

## Architecture

The backend follows a modular architecture:

```
server/
├── controllers/     # Request handlers
├── models/         # MongoDB schemas
├── routes/         # API route definitions
├── middleware/     # Custom middleware
├── data/          # Seed data and fixtures
└── index.js       # Entry point
```

### Key Components

- **Controllers**: Handle business logic and database operations
- **Models**: Define data structure and validation
- **Routes**: Define API endpoints and map to controllers
- **Middleware**: Handle authentication, logging, and error handling

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- MongoDB (v4.4 or later)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   # .env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/cardmatch
   JWT_SECRET=your_jwt_secret_key_change_in_production
   JWT_EXPIRES_IN=7d
   ```

3. Seed the database:
   ```bash
   node server/data/seed.js
   ```

4. Start the development server:
   ```bash
   npm run dev:server
   ```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST /api/auth/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:** Same as register

### Card Endpoints

#### GET /api/cards
Get all credit cards.

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "card_id",
      "name": "Premium Rewards Card",
      "provider": "Capital One",
      "category": "Travel",
      "annualFee": 95,
      "apr": {
        "min": 16.99,
        "max": 24.99
      }
    }
  ]
}
```

#### GET /api/cards/recommendations
Get personalized card recommendations (requires authentication).

**Response:** Same format as GET /api/cards with match scores

### User Endpoints

#### PUT /api/users/preferences
Update user preferences (requires authentication).

**Request Body:**
```json
{
  "categories": ["Travel", "Cash Back"],
  "annualFeePreference": "Low Fee",
  "creditScoreRange": "Good"
}
```

## Database Schema

### User Schema
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  preferences: {
    categories: [String],
    annualFeePreference: String,
    creditScoreRange: String
  },
  createdAt: Date
}
```

### Card Schema
```javascript
{
  name: String,
  provider: String,
  category: String,
  description: String,
  annualFee: Number,
  apr: {
    min: Number,
    max: Number
  },
  rewardsRate: String,
  signupBonus: String,
  creditScoreRequired: String,
  features: [String],
  imageUrl: String
}
```

## Authentication

The backend uses JWT (JSON Web Tokens) for authentication:

- Tokens are issued at login/registration
- Token expiration is configurable via JWT_EXPIRES_IN
- Protected routes use the auth middleware
- Passwords are hashed using bcrypt

## Development Guidelines

### Code Structure
- Use ES modules (import/export)
- Follow the controller-service pattern
- Keep business logic in controllers
- Use middleware for cross-cutting concerns

### Error Handling
- Use try/catch in async functions
- Return consistent error responses
- Log errors appropriately
- Use custom error classes

### API Response Format
```javascript
{
  success: boolean,
  data?: any,
  message?: string,
  error?: string
}
```

## Testing

### Unit Tests
- Test individual components
- Mock database calls
- Focus on business logic

### Integration Tests
- Test API endpoints
- Use test database
- Test authentication flow

### Running Tests
```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report
```

## Deployment

### Production Setup
1. Set secure environment variables
2. Enable production logging
3. Configure MongoDB production connection
4. Set up monitoring

### Security Checklist
- [ ] Secure JWT secret
- [ ] Enable rate limiting
- [ ] Set security headers
- [ ] Configure CORS properly
- [ ] Enable request validation
- [ ] Implement API key system

## Resources

### Official Documentation
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [JWT.io](https://jwt.io/)

### Security
- [OWASP Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

### Testing
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest for API Testing](https://github.com/visionmedia/supertest)

### Best Practices
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [REST API Design Best Practices](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md)
- [MongoDB Schema Design](https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design)