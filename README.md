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
NEXT_PUBLIC_WS_URL=http://localhost:4545
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

## Audio Processing & WebSocket Communication

The interview component implements real-time audio streaming for voice-based interviews. Here's how the audio chunking and sending flow works:

### Overview

The audio processing pipeline captures microphone input, converts it to the required format (PCM S16LE), buffers the audio data, and sends it in chunks via WebSocket to the backend server for real-time transcription and analysis.

### Audio Capture Setup

1. **Media Stream Access**: The component requests access to the user's microphone and camera using the Web Audio API:
   ```javascript
   navigator.mediaDevices.getUserMedia({
     audio: {
       sampleRate: 16000,      // 16 kHz sample rate
       channelCount: 1,         // Mono channel
       echoCancellation: true,
       noiseSuppression: true,
     },
     video: true
   })
   ```

2. **AudioContext Creation**: Creates an `AudioContext` with a 16 kHz sample rate to match the backend requirements.

3. **ScriptProcessorNode**: Uses a `ScriptProcessorNode` with a buffer size of 4096 samples to process audio in real-time.

### Audio Format Conversion

The raw audio from the browser comes as **Float32** samples (ranging from -1.0 to 1.0). The component converts this to **PCM S16LE** (16-bit signed little-endian) format required by the backend:

```javascript
// Convert float32 (-1.0 to 1.0) to int16 (PCM S16LE)
for (let i = 0; i < inputData.length; i++) {
  const s = Math.max(-1, Math.min(1, inputData[i])); // Clamp to [-1, 1]
  // Convert to 16-bit signed integer
  int16Data[i] = s < 0 ? Math.round(s * 0x8000) : Math.round(s * 0x7FFF);
}
```

### Chunking Strategy

1. **Buffering**: Audio samples are continuously collected in an `audioBuffer` array as `Int16Array` chunks from the `ScriptProcessorNode`.

2. **Chunk Duration**: Audio is sent in **10-second chunks** (160,000 samples at 16 kHz).

3. **Sending Interval**: Every 10 seconds, the component:
   - Concatenates all buffered audio data into a single `Int16Array`
   - Checks if the buffer contains at least one full 10-second chunk
   - If yes: sends a complete 10-second chunk and keeps remaining data
   - If no: sends whatever audio is available (partial chunk)

4. **WebSocket Transmission**: The audio chunks are sent as `ArrayBuffer` via WebSocket:
   ```javascript
   wsRef.current.send(chunk.buffer);
   ```

### Flow Diagram

```
Microphone Input
    ↓
MediaStream (Float32, 16kHz, Mono)
    ↓
AudioContext + ScriptProcessorNode
    ↓
Real-time Conversion: Float32 → PCM S16LE
    ↓
Buffer Accumulation (Int16Array[])
    ↓
Every 10 seconds:
    ↓
Concatenate Buffers
    ↓
Send via WebSocket (ArrayBuffer)
    ↓
Backend Processing (Transcription, Analysis)
```

### Key Technical Details

- **Sample Rate**: 16,000 Hz (16 kHz)
- **Bit Depth**: 16-bit signed integers
- **Byte Order**: Little-endian (PCM S16LE)
- **Channels**: Mono (single channel)
- **Chunk Size**: 160,000 samples (10 seconds of audio)
- **Buffer Size**: 4,096 samples per processing block
- **Transmission**: Binary data via WebSocket

### Error Handling

- Validates WebSocket connection before sending
- Handles microphone permission errors gracefully
- Manages audio context creation failures
- Cleans up resources on component unmount or interview stop

### Performance Considerations

- Audio processing happens in a separate thread (Web Audio API)
- Buffering prevents data loss during network fluctuations
- Efficient binary transmission reduces bandwidth usage
- Automatic cleanup prevents memory leaks

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

