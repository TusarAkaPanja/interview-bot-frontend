# Next.js Interview Component Usage

## Installation

1. Copy the `nextjs-interview-component.tsx` file to your Next.js project (e.g., `components/InterviewComponent.tsx`)

2. Install any required dependencies (if not already installed):
```bash
npm install
# No additional dependencies needed - uses native WebSocket and Media APIs
```

## Usage

### Basic Example

```tsx
'use client';

import InterviewComponent from '@/components/InterviewComponent';

export default function InterviewPage() {
  const token = 'your-interview-token-here'; // Get from API or props
  
  return (
    <div>
      <InterviewComponent 
        token={token}
        wsUrl="ws://localhost:8000" // Optional, defaults to localhost:8000
      />
    </div>
  );
}
```

### With Token from API

```tsx
'use client';

import { useEffect, useState } from 'react';
import InterviewComponent from '@/components/InterviewComponent';

export default function InterviewPage({ params }: { params: { token: string } }) {
  const [token, setToken] = useState<string>('');
  
  useEffect(() => {
    // Get token from URL params or API
    const urlToken = params.token || window.location.search.split('token=')[1];
    setToken(urlToken);
  }, [params]);
  
  if (!token) {
    return <div>Loading...</div>;
  }
  
  return (
    <InterviewComponent 
      token={token}
      wsUrl={process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}
    />
  );
}
```

## Features

### Audio Processing
- **Format**: PCM S16LE (16-bit signed little-endian)
- **Sample Rate**: 16 kHz
- **Chunk Size**: 5-second chunks
- **Encoding**: Automatic conversion from browser audio to PCM format

### WebSocket Events

The component handles these WebSocket message types:

1. **connection_established** - Connection successful
2. **transcription_update** - Real-time transcription updates
3. **scoring_update** - Answer scoring results
4. **next_question** - New question received
5. **interview_completed** - Interview finished
6. **error** - Error messages

### Controls

- **Connect**: Establishes WebSocket connection
- **Start Recording**: Requests media access and starts audio capture
- **Stop Recording**: Stops audio capture
- **Skip Question**: Skips current question
- **End Interview**: Ends the interview session
- **Disconnect**: Closes WebSocket connection

## Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

For production:
```env
NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

## Styling

The component uses Tailwind CSS classes. Make sure Tailwind is configured in your Next.js project, or replace the classes with your preferred styling solution.

## Browser Compatibility

- **WebSocket**: All modern browsers
- **MediaDevices API**: Chrome, Firefox, Safari, Edge
- **AudioContext**: Chrome, Firefox, Safari, Edge

## Testing

1. Start your Django backend with uvicorn
2. Start Celery worker
3. Get an interview token (or use any string for testing)
4. Open the Next.js page with the component
5. Click "Connect"
6. Click "Start Recording" (browser will ask for microphone permission)
7. Speak into the microphone
8. Watch the transcription appear in real-time

## Troubleshooting

### Microphone Not Working
- Check browser permissions
- Ensure HTTPS in production (required for getUserMedia)
- Check browser console for errors

### WebSocket Connection Failed
- Verify backend is running on correct port
- Check CORS settings
- Verify WebSocket URL is correct

### Audio Not Sending
- Check browser console for errors
- Verify WebSocket is connected (green status indicator)
- Check that recording has started

## Notes

- Video is requested but only used for visual feedback
- Audio is the only data sent to the backend
- Chunks are sent every 5 seconds automatically
- The component handles cleanup on unmount

