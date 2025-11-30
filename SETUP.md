# Quick Setup Guide

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and set your `JWT_SECRET`:
   ```env
   JWT_SECRET=your-secure-secret-key-here
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - You'll be redirected to `/login`

## Test Accounts

Use these accounts to test different roles:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vecna.com | admin123 |
| User | user@vecna.com | user123 |
| Interviewer | interviewer@vecna.com | interviewer123 |

## Features to Test

1. **Authentication**
   - Login with test accounts
   - Register a new account
   - Logout functionality

2. **Route Protection**
   - Try accessing `/home` without logging in (should redirect to login)
   - Login and verify access to protected routes

3. **Role-Based Access**
   - Login as different roles and observe menu items
   - Admin sees all menu items including "Admin Panel"
   - Interviewer sees "Candidates" but not "Admin Panel"
   - User sees basic menu items only

4. **Glassmorphic Design**
   - Observe the frosted glass effects on cards and buttons
   - Check the gradient backgrounds
   - Verify color palette usage

## Project Structure Overview

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Public routes (login, register)
│   ├── (protected)/       # Protected routes (home)
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn components
│   ├── auth/              # Auth components
│   ├── layout/            # Layout components
│   └── common/            # Shared components
├── lib/                   # Utilities (JWT, API, utils)
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── middleware.ts          # Route protection
```

## Next Steps

1. Connect to a real backend API
2. Replace mock authentication with database
3. Implement password hashing
4. Add more features based on requirements
5. Set up production environment variables

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### TypeScript Errors
```bash
# Regenerate types
npm run build
```

