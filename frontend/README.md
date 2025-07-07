# YouTube Video Downloader - Full Stack Application

A production-grade YouTube video downloader with modern web interface and robust backend processing.

## 🚀 Features

### Frontend (React + TypeScript + Tailwind)
- **Beautiful UI**: Modern glassmorphism design with smooth animations
- **Real-time Status**: Live progress tracking with polling
- **Advanced Options**: Support for cookies and restricted videos
- **Error Handling**: Comprehensive error states and user feedback
- **Responsive Design**: Works perfectly on all devices
- **URL Validation**: Smart YouTube URL validation

### Backend (FastAPI + Python)
- **Smart Downloads**: yt-dlp with retry logic and format fallbacks
- **Video Validation**: ffprobe validation to ensure quality
- **HEVC Conversion**: Automatic H.265 encoding with H.264 fallback
- **Cloud Storage**: Cloudinary integration with optimization
- **Task Management**: Async processing with status tracking
- **Error Detection**: Handles age-restricted, geo-blocked, and login-required videos

## 🛠 Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for build tooling

**Backend:**
- FastAPI (Python)
- yt-dlp for video downloading
- FFmpeg for video processing
- Cloudinary for cloud storage
- Uvicorn ASGI server

## 📦 Deployment

### Frontend (Vercel)

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Configure Build**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Update API URL**: In `src/config.ts`, replace the production URL with your Render backend URL
4. **Deploy**: Vercel will auto-deploy on every push

### Backend (Render)

1. **Create Web Service**: Connect your GitHub repo
2. **Configure Service**:
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && ./start.sh`
   - Environment: Python 3.11
3. **Set Environment Variables**:
   ```
   CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
   ```
4. **Deploy**: Render will build and deploy automatically

## 🔧 Local Development

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Cloudinary credentials
python main.py
```

### Frontend Setup
```bash
npm install
npm run dev
```

## 🌐 Environment Configuration

### Backend (.env)
```env
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
PORT=10000
```

### Frontend (src/config.ts)
```typescript
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-app.onrender.com'
  : 'http://localhost:10000';
```

## 📋 API Endpoints

- `POST /api/download` - Start video download
- `GET /api/status/{task_id}` - Check processing status
- `POST /api/upload-cookies` - Upload cookies.txt file
- `GET /health` - Health check for monitoring

## 🔒 Security Features

- CORS properly configured
- Input validation and sanitization
- Error handling without information leakage
- Secure file upload handling
- Rate limiting ready (can be added)

## 🎯 Production Ready Features

- **Error Handling**: Comprehensive error states and recovery
- **Logging**: Detailed logs for debugging and monitoring
- **Validation**: Input validation and file verification
- **Security**: Secure headers and CORS configuration
- **Performance**: Optimized builds and efficient processing
- **Monitoring**: Health checks and status endpoints

## 📱 Usage

1. **Enter YouTube URL**: Paste any YouTube video URL
2. **Advanced Options**: Optionally add cookies for restricted videos
3. **Download**: Click "Download & Convert" to start processing
4. **Track Progress**: Watch real-time status updates
5. **Get Result**: Receive Cloudinary URL when complete

## 🚨 Error Handling

The application handles various scenarios:
- Invalid YouTube URLs
- Age-restricted videos
- Geo-blocked content
- Network timeouts
- Conversion failures
- Server errors

## 📊 File Structure

```
├── src/                    # Frontend source
│   ├── App.tsx            # Main React component
│   ├── config.ts          # Environment configuration
│   └── ...
├── backend/               # Backend source
│   ├── main.py           # FastAPI application
│   ├── downloader.py     # yt-dlp wrapper
│   ├── convert.py        # Video conversion
│   ├── cloudinary_uploader.py # Cloud upload
│   └── ...
├── vercel.json           # Vercel configuration
└── README.md             # Documentation
```

## 🎉 Ready for Production

Both frontend and backend are fully production-ready with:
- ✅ Error handling and validation
- ✅ Security best practices
- ✅ Performance optimization
- ✅ Monitoring and logging
- ✅ Responsive design
- ✅ Cloud deployment ready