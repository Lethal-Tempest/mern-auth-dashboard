# MERN Auth Dashboard - Frontend Developer Intern Task (Daksh Arora)

A scalable web app with Authentication + Dashboard, built with React and Node/Express, featuring JWT-based auth, profile fetch/update, and Tasks CRUD with search/filter UI.

## About This Project
This project was built as a submission for the **Frontend Developer Intern** position at **PrimeTrade.ai**.

**Candidate**: Daksh Arora

---

## Deliverables Covered
- ✅ Frontend (React) + Basic Backend (Node/Express) in this GitHub repo.
- ✅ Functional authentication (register/login/logout with JWT).
- ✅ Dashboard with CRUD-enabled entity (Tasks) + search/filter.
- ✅ API docs + Postman collection (see `docs/`).
- ✅ Production scaling note (see `docs/SCALING.md`).

---

## Tech Stack
- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (Bearer token) + bcrypt password hashing
- **Validation**: Zod (server-side), custom validators (client-side)

---

## Project Structure
```
mern-auth-dashboard/
  client/
    src/
      app/
        App.jsx
        routes.jsx
        ProtectedRoute.jsx
      components/
        Input.jsx
        Modal.jsx
        Navbar.jsx
        Shell.jsx
      pages/
        Login.jsx
        Register.jsx
        Dashboard.jsx
        NotFound.jsx
      services/
        apiClient.js
        authService.js
        profileService.js
        taskService.js
      styles/
        globals.css
      utils/
        auth.js
        validators.js
      main.jsx
    .env
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js

  server/
    src/
      app.js
      server.js
      config/
        db.js
      middleware/
        authMiddleware.js
        errorMiddleware.js
      models/
        User.js
        Task.js
      validators/
        auth.validators.js
        users.validators.js
        tasks.validators.js
      controllers/
        auth.controller.js
        users.controller.js
        tasks.controller.js
      routes/
        auth.routes.js
        users.routes.js
        tasks.routes.js
      services/
        token.service.js
    .env.example
    package.json

  docs/
    API_DOCS.md
    POSTMAN_COLLECTION.json
    SCALING.md
  
  README.md
  .gitignore
```

---

## Quick Start (Local Development)

### 1) Prerequisites
- **Node.js** (LTS v16+)
- **MongoDB** (free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git**

### 2) Clone & Install
```bash
git clone <YOUR_GITHUB_REPO_URL>.git
cd mern-auth-dashboard

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3) Configure Environment

**`server/.env`:**
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**`client/.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4) Run
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

**App will be at**: http://localhost:5173

---

## Features

### Authentication (JWT-based)
- ✅ Register with name, email, password
- ✅ Login with email + password
- ✅ Logout (clear token)
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ JWT middleware on protected routes

### Dashboard (Protected Route)
- ✅ Display & update user profile (name, email)
- ✅ Tasks CRUD:
  - Create task (title, description, status)
  - Read all tasks (per user)
  - Update task
  - Delete task
- ✅ Search by title/description
- ✅ Filter by status (`todo`, `in_progress`, `done`)

### Security & Validation
- ✅ Client-side validation (email, password length, required fields)
- ✅ Server-side validation (Zod schemas)
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication middleware
- ✅ User isolation (tasks belong only to their creator)
- ✅ Centralized error handling

---

## API Overview

**Base URL**: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <JWT_TOKEN>`

### Auth
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout

### Profile
- `GET /users/me` - Get current user
- `PUT /users/me` - Update user profile

### Tasks
- `POST /tasks` - Create task
- `GET /tasks?search=...&status=...` - List tasks (with search/filter)
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

**Full docs**: See `docs/api.md`

---

## Documentation Files

1. **`docs/api.md`** - Complete API reference with examples
2. **`docs/postman_collection.json`** - Import into Postman for testing
3. **`docs/SCALING.md`** - Production scaling strategies

---

## Testing

### Manual Checklist
- [ ] Register a new account
- [ ] Login with credentials
- [ ] View profile
- [ ] Update profile (name/email)
- [ ] Create task
- [ ] Update task
- [ ] Delete task
- [ ] Search tasks by title
- [ ] Filter tasks by status
- [ ] Logout and verify redirect
- [ ] Try accessing `/dashboard` without token → redirect to login

### Postman Testing
1. Import `docs/postman_collection.json` into Postman
2. Set `baseUrl` variable to `http://localhost:5000/api`
3. Register a user → copy JWT from response
4. Set `token` variable with the JWT
5. Test all endpoints (they should return 200)

---

## Security Practices

✅ **Password Hashing**: bcrypt (10 salt rounds)  
✅ **JWT Authentication**: Bearer token in Authorization header  
✅ **Protected Routes**: Frontend + backend JWT middleware  
✅ **Input Validation**: Zod (server-side)  
✅ **Error Handling**: Centralized middleware  
✅ **Database Security**: User email (unique index), Task owner (filtered)  
✅ **User Isolation**: Users can only see/edit their own tasks

---

## Development Architecture

### Frontend
- **Routing**: React Router with protected routes (`ProtectedRoute` component)
- **API**: Axios with JWT interceptors (auto-attach token to headers)
- **State**: React hooks (useState)
- **Styling**: TailwindCSS with custom gradients
- **Validation**: Client-side validators + server error display

### Backend
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT tokens (7-day expiry)
- **Validation**: Zod schemas
- **Structure**: MVC (Models, Views/Controllers, Services)
- **Error Handling**: Centralized error middleware

---

## Troubleshooting

### Frontend won't connect
- Verify `VITE_API_URL` in `client/.env`
- Check backend is running (`npm run dev` in `server/`)
- Check CORS: `CLIENT_URL` in `server/.env` should match frontend URL

### Login fails
- Verify MongoDB connection (check `MONGO_URI`)
- Check `JWT_SECRET` is set consistently
- Check server logs for detailed errors

### Build issues
- Delete `node_modules/` and reinstall: `npm install`
- Verify Node.js version: `node --version` (should be v16+)

---

## Production Scaling Notes

See **`docs/SCALING.md`** for detailed strategies on:
- Token management (refresh tokens, httpOnly cookies)
- Database optimization (indexes, pagination)
- API performance (rate limiting, caching, compression)
- Frontend optimization (code splitting, lazy loading)
- Deployment strategies (separate backend/frontend)
- Monitoring & logging
- Testing & CI/CD
- Security hardening

---

## Submission Notes

**Candidate**: Daksh Arora  
**Position**: Frontend Developer Intern  
**Company**: PrimeTrade.ai  
**Date**: December 2025

This project fulfills all 5 deliverables:
1. ✅ Frontend (React) + Backend (Node/Express) in GitHub repo
2. ✅ Functional authentication (register/login/logout with JWT)
3. ✅ Dashboard with CRUD-enabled entity (Tasks) + search/filter
4. ✅ Postman collection & API docs (`docs/`)
5. ✅ Production scaling note (`docs/SCALING.md`)

---

## License
Created for Frontend Developer Intern Task at PrimeTrade.ai

---

## Next Steps

1. **Clone & Test Locally**
   ```bash
   git clone <repo>.git
   cd mern-auth-dashboard
   # Follow "Quick Start" section above
   ```

2. **Test with Postman**
   - Import `docs/postman_collection.json`
   - Test all endpoints

3. **Review Code**
   - Clean, modular structure
   - Separated concerns (controllers, services, validators)
   - Proper error handling

4. **Submit to PrimeTrade.ai**
   - GitHub repo URL
   - This README
   - Verification that app runs locally

---

For questions or issues, refer to the API docs (`docs/API_DOCS.md`) or review the code comments in the respective files.
