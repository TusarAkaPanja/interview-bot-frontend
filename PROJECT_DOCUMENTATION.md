# Vecna - AI Interview Bot Frontend

## Project Overview

Vecna is an AI-powered interview bot application built with Next.js 15. The frontend implements a glassmorphic design with role-based authentication and JWT access control.

## Technology Stack

### Core Framework
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework

### UI & Design
- **shadcn/ui**: High-quality React components
- **lucide-react**: Icon library
- **Glassmorphic Design**: Modern glass-like UI effects

### State Management & Data Fetching
- **Zustand**: Lightweight state management
- **TanStack Query (React Query)**: Server state management and data fetching
- **Zod**: Schema validation

## Design System

### Color Palette
- **Primary Yellow**: `#f9de8a` (249,222,138) - Primary accent
- **Primary Blue**: `#3ec7f0` (62,199,240) - Primary actions
- **Error Red**: `#eb2d32` (235,45,50) - Errors and warnings
- **Accent Pink**: `#b02274` (176,34,116) - Secondary accents
- **Dark Purple**: `#562c84` (86,44,132) - Dark backgrounds

### Design Principles
- **Glassmorphic**: Frosted glass effect with backdrop blur
- **Minimal**: Clean, uncluttered interface
- **Modern**: Contemporary UI patterns

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (protected)/
│   │   ├── home/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/
│   │       ├── login/
│   │       ├── register/
│   │       └── verify/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/          # shadcn components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── ProtectedLayout.tsx
│   └── common/
│       └── Logo.tsx
├── lib/
│   ├── utils.ts
│   ├── jwt.ts
│   └── api.ts
├── store/
│   └── authStore.ts
├── types/
│   └── auth.ts
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Authentication Flow

### JWT Token Structure
```typescript
{
  userId: string;
  email: string;
  role: 'admin' | 'user' | 'interviewer';
  iat: number;
  exp: number;
}
```

### Authentication States
1. **Unauthenticated**: No token, redirect to login
2. **Authenticated**: Valid token, access to protected routes
3. **Token Expired**: Invalid/expired token, redirect to login

### Role-Based Access Control (RBAC)
- **Admin**: Full access to all features
- **User**: Standard user access
- **Interviewer**: Interview-specific access

## Route Protection

### Public Routes
- `/login` - Login page
- `/register` - Registration page
- `/` - Landing page (redirects based on auth state)

### Protected Routes
- `/home` - Dashboard (requires authentication)
- All routes under `(protected)` group

### Middleware Strategy
- Check JWT token in cookies/headers
- Validate token expiration
- Verify role permissions
- Redirect unauthorized users

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Token verification

## State Management

### Auth Store (Zustand)
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}
```

## Component Architecture

### Authentication Components
- `LoginForm`: Login form with validation
- `RegisterForm`: Registration form with validation

### Layout Components
- `Header`: Navigation header with user menu
- `Sidebar`: Sidebar navigation with role-based menu items
- `ProtectedLayout`: Layout wrapper for protected routes

### Common Components
- `Logo`: Vecna logo component

## Best Practices

1. **Minimal useEffect**: Use React Query for data fetching, Zustand for client state
2. **Server Components**: Leverage Next.js 15 server components where possible
3. **Type Safety**: Full TypeScript coverage with Zod validation
4. **Error Handling**: Comprehensive error boundaries and handling
5. **Performance**: Code splitting, lazy loading, and optimized images
6. **Security**: JWT validation, XSS protection, CSRF tokens

## Development Guidelines

1. **Component Structure**: Atomic design principles
2. **Styling**: Tailwind utility classes with custom CSS for glassmorphic effects
3. **Forms**: Zod schema validation with react-hook-form
4. **API Calls**: TanStack Query for all server interactions
5. **State**: Zustand for global state, React Query for server state

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
JWT_SECRET=your-secret-key
NEXT_PUBLIC_APP_NAME=Vecna
```

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables
3. Run development server: `npm run dev`
4. Build for production: `npm run build`

## Future Enhancements

- Interview scheduling
- Real-time chat interface
- Video interview capabilities
- Analytics dashboard
- User profile management

