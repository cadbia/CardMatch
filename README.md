# CardMatch - Frontend Application

CardMatch is a React-based web application that helps users find the perfect credit card based on their preferences and spending habits. This frontend provides a clean, responsive interface for users to interact with the card matching service.

## Table of Contents

- [Project Overview](#project-overview)
- [File Structure](#file-structure)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building for Production](#building-for-production)

## Project Overview

CardMatch is designed to simplify the process of finding the right credit card. The application uses a smart matching algorithm to recommend cards based on user preferences and spending patterns.

Key features:
- User authentication (login/signup)
- Dashboard with personalized card recommendations
- Responsive design for all device sizes

## File Structure

```
card-match-frontend/
├── public/               # Static assets
├── src/                  # Source code
│   ├── components/       # Reusable UI components
│   │   └── Navbar.tsx    # Navigation component
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx # User dashboard with card recommendations
│   │   ├── LandingPage.tsx # Home page
│   │   ├── LoginPage.tsx # Authentication page
│   │   └── NotFound.tsx  # 404 page
│   ├── services/         # API and service functions
│   │   └── api.ts        # API client setup and functions
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts      # Shared type definitions
│   ├── App.tsx           # Main application component with routing
│   ├── index.css         # Global styles (Tailwind imports)
│   ├── main.tsx          # Application entry point
│   └── vite-env.d.ts     # Vite type definitions
├── .eslintrc.js          # ESLint configuration
├── index.html            # HTML entry point
├── package.json          # Project dependencies and scripts
├── postcss.config.js     # PostCSS configuration for Tailwind
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite bundler configuration
```

### Key Directories and Files

- **components/**: Reusable UI components used across multiple pages
- **pages/**: Top-level page components that correspond to routes
- **services/**: API client and service functions for data fetching
- **types/**: TypeScript type definitions for better code quality
- **App.tsx**: Main component with routing configuration
- **main.tsx**: Application entry point that renders the App component

## Technologies Used

- **React**: UI library for building the user interface
- **TypeScript**: For type safety and better developer experience
- **React Router**: For navigation and routing
- **Tailwind CSS**: For styling and responsive design
- **Axios**: For API requests
- **Vite**: For fast development and optimized builds
- **Lucide React**: For icons

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/card-match-frontend.git
   cd card-match-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Development

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run lint`: Run ESLint to check for code issues
- `npm run preview`: Preview the production build locally

### Adding New Features

When adding new features:

1. Create new components in the `components/` directory if they're reusable
2. Create new pages in the `pages/` directory if they represent a new route
3. Add new routes in `App.tsx`
4. Add new API functions in `services/api.ts`
5. Add new types in `types/index.ts`

## Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

This will create a `dist` directory with the optimized production build. You can then deploy this directory to your hosting provider of choice.

For a local preview of the production build:

```bash
npm run preview
# or
yarn preview
```