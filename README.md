# Vecna - AI Interview Bot Frontend

A modern, glassmorphic Next.js 15 application for AI-powered interview management.

## Features

- 🔐 **Authentication**: JWT-based authentication with role-based access control
- 🎨 **Glassmorphic Design**: Modern frosted glass UI with custom color palette
- 🛡️ **Route Protection**: Middleware-based route protection
- 👥 **Role-Based Access**: Admin, User, and Interviewer roles with menu restrictions
- ⚡ **Modern Stack**: Next.js 15, TypeScript, Tailwind CSS, Zustand, React Query

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Validation**: Zod
- **Forms**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
JWT_SECRET=your-secret-key-change-in-production
NEXT_PUBLIC_APP_NAME=Vecna
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/          # Public auth routes
│   │   ├── login/
│   │   └── register/
│   ├── (protected)/     # Protected routes
│   │   └── home/
│   ├── api/             # API routes
│   │   └── auth/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Root page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/              # shadcn components
│   ├── auth/            # Auth components
│   ├── layout/          # Layout components
│   └── common/          # Common components
├── lib/                 # Utilities
├── store/               # Zustand stores
├── types/               # TypeScript types
└── middleware.ts        # Next.js middleware
```

## Authentication

### Test Accounts

The application includes mock authentication for testing:

- **Admin**: `admin@vecna.com` / `admin123`
- **User**: `user@vecna.com` / `user123`
- **Interviewer**: `interviewer@vecna.com` / `interviewer123`

### Roles

- **Admin**: Full access to all features including admin panel
- **Interviewer**: Access to interviews and candidates
- **User**: Standard user access

## Design System

### Color Palette

- **Primary Yellow**: `#f9de8a`
- **Primary Blue**: `#3ec7f0`
- **Error Red**: `#eb2d32`
- **Accent Pink**: `#b02274`
- **Dark Purple**: `#562c84`

### Glassmorphic Styles

The application uses custom glassmorphic utility classes:
- `.glass` - Basic glass effect
- `.glass-card` - Card with glass effect
- `.glass-button` - Button with glass effect
- `.glass-dark` - Dark glass variant

## API Routes

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Token verification

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Security Notes

⚠️ **Important**: This is a development setup with mock authentication. For production:

1. Replace mock user storage with a real database
2. Implement proper password hashing (bcrypt)
3. Use secure JWT secret in environment variables
4. Implement CSRF protection
5. Add rate limiting
6. Use HTTPS in production

## License

Private - HCL Tech

