<div align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-4EA94B?style=for-the-badge&logo=mongodb" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  
  <h1>🍲 Tuppagram</h1>
  <p><strong>The Social Network for Food Lovers & Home Chefs</strong></p>
</div>

---

## 📖 About The Project

**Tuppagram** is a full-stack MERN application designed to bring culinary enthusiasts together. Far beyond a simple recipe book, it acts as a fully-fledged social network where users can share their daily meals, publish detailed step-by-step recipes, follow their favorite creators, and interact through likes and comments.

Originally built on a robust, secure boilerplate, Tuppagram features a warm, modern visual identity (terracotta & cream), an intuitive "Native App" feel for mobile users (Bottom Navigation Bar), and a robust backend to handle social networking data relationships.

### 🎯 Goal & Purpose

The goal of Tuppagram is to provide a seamless, aesthetically pleasing, and highly interactive platform for food sharing. Whether it's a quick snap of today's lunch or an elaborate family recipe with multi-step instructions and photo galleries, Tuppagram is the place to document and discover culinary inspiration. ^ih419w

---

## ✨ Key Features

- **Social Feed & Interactions**: Create text and photo posts, link posts to specific recipes, like, and comment.
- **Advanced Recipe Engine**: Create comprehensive recipes including preparation time, difficulty, dynamic ingredients lists, step-by-step instructions, categories, and multiple photos.
- **User Profiles & Networking**: Follow/Unfollow users, view their specific posts and recipes, and explore their follower network.
- **Robust Authentication**: JWT-based authentication, password hashing, and optional Firebase Google OAuth integration.
- **Image Management**: Seamless photo uploads for avatars, posts, and recipes, handled via `multer` locally.
- **Modern UI/UX**: Built with Tailwind CSS and Shadcn UI. Fully responsive with a dedicated Mobile Bottom Tab Bar layout and Light/Dark mode.
- **Real-Time Readiness**: Integrated WebSocket capabilities for online status tracking and real-time social notifications.

---

## 🏗️ Architecture & Code Structure

The project follows a standard decoupled Client/Server architecture using **TypeScript** across the entire stack.

### Backend (`/server`)

An Express.js REST API using MongoDB (via Mongoose) to handle data storage.

- **`src/models/`**: Mongoose schemas defining the data structure (`User`, `Post`, `Recipe`, `Comment`, `Like`, `Log`, `Config`).
- **`src/controllers/`**: Core business logic. Separated by domain (e.g., `postController.ts`, `recipeController.ts`).
- **`src/routes/`**: API endpoint definitions, mapped to their respective controllers and protected by the `verifyToken` middleware.
- **`src/middlewares/`**: Request interceptors (Authentication, File upload configurations via Multer).
- **`src/utils/`**: Helper functions, Enums, and custom Error handling.
- **`uploads/`**: Local storage directory for user avatars, post images, and recipe photos.

### Frontend (`/client`)

A Vite-powered React 19 application utilizing Tailwind CSS v4 and React Router v7.

- **`src/components/`**: Reusable UI components (mostly from Shadcn UI, plus layout components like `Navbar`, `Footer`, `PostCard`).
- **`src/pages/`**: View-level components mapping directly to application routes (`Home`, `Profile`, `Create`, `Recipes`).
- **`src/contexts/`**: Global state management (e.g., `authContext.tsx` for user sessions).
- **`src/lib/`**: Utilities, specifically Zod schemas for robust form validation (`react-hook-form` + `@hookform/resolvers/zod`).
- **`src/config/`**: Axios configuration and interceptors for authenticated API calls.

---

## 🚀 Getting Started

### Requirements

- **Node.js**: v22.x or higher
- **pnpm**: v10.x or higher
- **MongoDB**: v8.x or higher (Local or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Tuppagram.git
cd Tuppagram
```

### 2. Backend Setup

```bash
cd server
pnpm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONG_URI=mongodb://127.0.0.1:27017/tuppagram
SECRET_ACCESS_TOKEN=your_super_secret_jwt_token
CORS_ORIGIN=http://localhost:5173
```

Start the development server:

```bash
pnpm dev
```

### 3. Frontend Setup

Open a new terminal window:

```bash
cd client
pnpm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:

```bash
pnpm dev
```

Your app will now be running at `http://localhost:5173`.

---

## 🎨 Styling & Design Guidelines

- **Tailwind CSS**: Utility classes are used exclusively. Avoid writing custom CSS unless absolutely necessary (added to `index.css`).
- **Shadcn UI**: Base components (Buttons, Dialogs, Forms, Inputs) are generated via Shadcn. Modify their logic in `src/components/ui` if necessary.
- **Theme**: Tuppagram uses a specific Terracotta/Cream color palette, managed via CSS variables in `client/src/index.css`.
- **Responsive Design**: Ensure all views use `md:` prefixes to support both the desktop header layout and the mobile Bottom Navigation layout.

---

## 🤝 Contributing

When contributing to Tuppagram:

1. Ensure your code is strictly typed with TypeScript interfaces.
2. Form interactions must be validated using `Zod` schemas.
3. Make sure to maintain the visual consistency of the Terracotta theme.
4. Test responsive behaviors down to mobile viewport widths (375px).

Happy Coding! 🍳👩‍🍳
