# Focus Bubble – Distraction Tracker

A modern web application that helps students and professionals stay focused by tracking tab switches, window changes, and other distractions during study or work sessions.

## 🎯 Features

### Core Functionality
- **Session Timer**: Clean, easy-to-read timer display with start/pause/resume/reset controls
- **Distraction Tracking**: Automatically detects and counts distractions (tab switches, window changes)
- **Real-time Status**: Visual indicators showing current focus state
- **Session Statistics**: Track total time, focus rate, and session count
- **Data Export**: Download session data as JSON for analysis

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Keyboard Shortcuts**: Quick controls for power users
- **Audio Controls**: Volume control and mute functionality
- **Help System**: Built-in help modal with instructions and shortcuts
- **Toast Notifications**: Subtle notifications for important events
- **Session Recovery**: Automatically restore sessions after page refresh

### Accessibility
- **Semantic HTML**: Proper structure for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Indicators**: Clear visual focus states
- **Reduced Motion**: Respects user's motion preferences
- **High Contrast**: Supports high contrast mode

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in your web browser
2. Click "Start Study Session" to begin tracking
3. Stay focused! The app will track any distractions
4. Use pause/resume as needed
5. View your statistics and download data when done

### Keyboard Shortcuts
- `Space` - Pause/Resume session
- `R` - Reset session
- `M` - Mute/Unmute sounds
- `H` - Show/Hide help
- `T` - Toggle theme
- `Escape` - Close modals

## 📁 Project Structure

```
Focus-Bubble/
├── index.html          # Main HTML structure
├── styles.css          # Complete CSS styling with themes
├── ui.js              # UI controller and interactions
├── timer.js           # Timer functionality
├── distraction.js     # Distraction detection and tracking
├── storage.js         # Data persistence and statistics
└── README.md          # This file
```

## 🛠️ Technical Details

### Architecture
The application follows a modular architecture with separate controllers for different responsibilities:

- **UIController**: Manages all user interface interactions, themes, and visual updates
- **TimerController**: Handles session timing and timer functionality
- **DistractionController**: Detects and tracks various types of distractions
- **StorageController**: Manages data persistence and session history

### Browser Compatibility
- Modern browsers with ES6+ support
- Page Visibility API for distraction detection
- localStorage for data persistence
- Web Audio API for notification sounds

### Customization
The application uses CSS custom properties (variables) for easy theming:
- Colors, spacing, and animations can be customized
- Responsive breakpoints for different screen sizes
- Print styles for session reports

## 📊 Data Export Format

The exported JSON includes:
- Session metadata and timing
- Detailed distraction logs with timestamps
- Statistical summaries and insights
- Session-by-session breakdowns

## 🎨 Design Philosophy

**Clean & Distraction-Free**: The interface is intentionally minimal to avoid adding to your distractions.

**Focus-First**: Large, clear timer display and obvious status indicators help you stay aware of your focus state.

**Student-Friendly**: Designed specifically for study sessions with features like session recovery and detailed analytics.

## 🔮 Future Enhancements

- Pomodoro timer integration
- Goal setting and achievements
- Data visualization charts
- Study session categorization
- Integration with productivity apps
- Browser extension version

## 📱 Mobile Support

The application is fully responsive and works well on mobile devices, though it's primarily designed for desktop study sessions.

## 🤝 Contributing

This is a student project built with vanilla JavaScript, HTML, and CSS. Contributions and suggestions are welcome!

---

**Focus Bubble** - Built for students, by students. Stay focused, stay productive! 🎯
