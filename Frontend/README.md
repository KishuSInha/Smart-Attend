# Smart Attend - Rural School Attendance System

A comprehensive digital attendance solution designed specifically for rural schools with offline support, multi-role access, and low-bandwidth optimization.

## 🚀 Features

- **Multi-Role Dashboard**: Student, Teacher, Admin, and Education Department views
- **Attendance Methods**: Manual entry and camera-based face recognition
- **Offline Support**: PWA with service worker for offline functionality  
- **Mobile-First Design**: Optimized for smartphones and tablets
- **Dark Theme**: High contrast design for better visibility
- **Mock/Real API Toggle**: Easy switching between demo and production data
- **Export Capabilities**: CSV downloads and print-ready reports
- **Dropout Analytics**: Automated calculation and tracking

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Query + Context API
- **UI Components**: Custom design system with shadcn/ui base
- **PWA**: Service Worker + Web App Manifest
- **Data**: Mock API with IndexedDB for offline storage

## 🚀 Quick Start

### Development Setup

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd smartattend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open http://localhost:8080

### Production Build

```bash
npm run build
npm run preview
```

## 🔧 Configuration

### API Mode Switching

Edit `src/utils/mockData.ts`:

```javascript
export const API_CONFIG = {
  USE_MOCK: true,  // Set to false for real API
  BASE_URL: "http://127.0.0.1:5000/api"
};
```

### Mock Data

The system includes comprehensive mock data for:
- 8 students across multiple classes
- 3 teachers with different subjects  
- 5 schools with realistic metrics
- Attendance records and analytics

## 📱 PWA Features

### Offline Support
- Service worker caches essential assets
- Background sync for attendance data
- Offline fallback pages
- IndexedDB for local data storage

### Installation
1. Visit the app in Chrome/Edge
2. Look for "Install" prompt or menu option
3. Add to home screen for native app experience

### Testing Offline Mode
1. Install the PWA
2. Open Chrome Developer Tools
3. Go to Application > Service Workers
4. Check "Offline" 
5. Reload page - should work offline

## 🎨 Design System

### Color Scheme
- **Background**: Pure black (#000000)
- **Text**: White (#ffffff)  
- **Primary**: Education blue (#1E90FF)
- **Success**: Green (#22c55e)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### Role-Based Colors
- **Student**: Cyan (#00bcd4)
- **Teacher**: Purple (#9c27b0) 
- **Admin**: Orange (#ff9800)
- **Education**: Magenta (#e91e63)

## 📊 User Roles & Features

### Student Dashboard
- Personal attendance percentage
- Daily/period-wise attendance status
- Progress tracking and goals
- Class rank and achievements

### Teacher Dashboard  
- Class-wise attendance management
- Manual and camera attendance entry
- Student search and bulk operations
- CSV export and reporting

### Admin Dashboard
- User management and roles
- System configuration
- Database backup and maintenance
- School-wide analytics

### Education Department
- Multi-school oversight
- District-wide reporting
- Dropout rate analysis
- Performance comparisons

## 🔐 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Student | student123 | pass123 |
| Teacher | teacher123 | pass123 |
| Admin | admin123 | pass123 |
| Education | education123 | pass123 |

## 📱 Mobile Features

- **Touch-Optimized**: 44px minimum touch targets
- **Responsive Design**: Works on all screen sizes
- **Gesture Support**: Swipe navigation where appropriate
- **Camera Integration**: Face recognition attendance
- **Offline Sync**: Data syncs when connection restored

## 🛠️ Development

### Project Structure
```
src/
├── components/         # Reusable UI components
├── pages/             # Route components
│   ├── dashboards/    # Role-specific dashboards
├── hooks/             # Custom React hooks  
├── utils/             # Utilities and mock data
└── assets/            # Static assets
```

### Key Files
- `src/utils/mockData.ts` - Mock API and data
- `src/hooks/useToast.tsx` - Toast notification system
- `public/sw.js` - Service Worker for PWA
- `public/manifest.json` - PWA configuration

## 🚀 Deployment

### Lovable Platform
1. Click "Publish" in the Lovable editor
2. Your app will be deployed automatically
3. Custom domains available with paid plans

### Manual Deployment
Works with any static hosting:
- Netlify
- Vercel  
- GitHub Pages
- Firebase Hosting

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Smart Attend** - Empowering rural education through technology 🎓