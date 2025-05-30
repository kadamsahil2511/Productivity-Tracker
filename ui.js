/* ==========================================================================
   Focus Bubble - UI Controller
   Handles all user interface interactions and visual updates
   ========================================================================== */

class UIController {
    constructor() {
        this.elements = {};
        this.state = {
            isSessionActive: false,
            isPaused: false,
            currentTime: 0,
            distractionCount: 0,
            isMuted: false,
            volume: 50,
            theme: 'light'
        };
        
        this.init();
    }

    /* ==========================================================================
       Initialization
       ========================================================================== */

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadSettings();
        this.updateUI();
        this.showWelcomeMessage();
    }

    cacheElements() {
        // Timer elements
        this.elements.timerDisplay = document.getElementById('timerDisplay');
        this.elements.sessionStatus = document.getElementById('sessionStatus');
        
        // Distraction elements
        this.elements.distractionCount = document.getElementById('distractionCount');
        this.elements.focusStatus = document.getElementById('focusStatus');
        
        // Control buttons
        this.elements.startBtn = document.getElementById('startBtn');
        this.elements.pauseBtn = document.getElementById('pauseBtn');
        this.elements.resumeBtn = document.getElementById('resumeBtn');
        this.elements.resetBtn = document.getElementById('resetBtn');
        this.elements.clearDataBtn = document.getElementById('clearDataBtn');
        this.elements.downloadBtn = document.getElementById('downloadBtn');
        
        // Header controls
        this.elements.themeToggle = document.getElementById('themeToggle');
        this.elements.helpBtn = document.getElementById('helpBtn');
        
        // Audio controls
        this.elements.muteBtn = document.getElementById('muteBtn');
        this.elements.volumeSlider = document.getElementById('volumeSlider');
        this.elements.volumeDisplay = document.getElementById('volumeDisplay');
        
        // Statistics
        this.elements.totalTime = document.getElementById('totalTime');
        this.elements.focusRate = document.getElementById('focusRate');
        this.elements.sessionCount = document.getElementById('sessionCount');
        
        // Modal elements
        this.elements.helpModal = document.getElementById('helpModal');
        this.elements.closeHelp = document.getElementById('closeHelp');
        
        // Toast container
        this.elements.toastContainer = document.getElementById('toastContainer');
        
        // Audio elements
        this.elements.distractionAudio = document.getElementById('distractionAudio');
    }

    /* ==========================================================================
       Event Binding
       ========================================================================== */

    bindEvents() {
        // Control button events
        this.elements.startBtn.addEventListener('click', () => this.handleStartSession());
        this.elements.pauseBtn.addEventListener('click', () => this.handlePauseSession());
        this.elements.resumeBtn.addEventListener('click', () => this.handleResumeSession());
        this.elements.resetBtn.addEventListener('click', () => this.handleResetSession());
        this.elements.clearDataBtn.addEventListener('click', () => this.handleClearData());
        this.elements.downloadBtn.addEventListener('click', () => this.handleDownloadData());
        
        // Header control events
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.helpBtn.addEventListener('click', () => this.toggleHelp());
        this.elements.closeHelp.addEventListener('click', () => this.hideHelp());
        
        // Audio control events
        this.elements.muteBtn.addEventListener('click', () => this.toggleMute());
        this.elements.volumeSlider.addEventListener('input', (e) => this.updateVolume(e.target.value));
        
        // Modal events
        this.elements.helpModal.addEventListener('click', (e) => {
            if (e.target === this.elements.helpModal) {
                this.hideHelp();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Window events for session recovery
        window.addEventListener('beforeunload', () => this.saveState());
        window.addEventListener('load', () => this.restoreState());
        
        // Visibility API for distraction detection
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        window.addEventListener('blur', () => this.handleWindowBlur());
        window.addEventListener('focus', () => this.handleWindowFocus());
    }

    /* ==========================================================================
       Session Control Handlers
       ========================================================================== */

    handleStartSession() {
        this.state.isSessionActive = true;
        this.state.isPaused = false;
        this.updateSessionStatus('Session Active - Stay Focused!');
        this.updateButtonStates();
        this.animateTimerDisplay(true);
        this.showToast('Session started! Stay focused.', 'success');
        
        // Emit event for timer controller
        this.emit('sessionStart');
    }

    handlePauseSession() {
        this.state.isPaused = true;
        this.updateSessionStatus('Session Paused');
        this.updateButtonStates();
        this.animateTimerDisplay(false);
        this.showToast('Session paused.', 'info');
        
        // Emit event for timer controller
        this.emit('sessionPause');
    }

    handleResumeSession() {
        this.state.isPaused = false;
        this.updateSessionStatus('Session Active - Stay Focused!');
        this.updateButtonStates();
        this.animateTimerDisplay(true);
        this.showToast('Session resumed! Stay focused.', 'success');
        
        // Emit event for timer controller
        this.emit('sessionResume');
    }

    handleResetSession() {
        if (this.state.isSessionActive || this.state.currentTime > 0) {
            if (!confirm('Are you sure you want to reset the current session?')) {
                return;
            }
        }
        
        this.state.isSessionActive = false;
        this.state.isPaused = false;
        this.state.currentTime = 0;
        this.state.distractionCount = 0;
        
        this.updateTimer(0);
        this.updateDistractionCount(0);
        this.updateSessionStatus('Ready to Focus');
        this.updateFocusStatus(true);
        this.updateButtonStates();
        this.animateTimerDisplay(false);
        this.showToast('Session reset.', 'info');
        
        // Emit event for other controllers
        this.emit('sessionReset');
    }

    handleClearData() {
        if (!confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
            return;
        }
        
        // Clear UI state
        this.handleResetSession();
        
        // Reset statistics
        this.updateStatistics({ totalTime: 0, focusRate: 100, sessionCount: 0 });
        
        this.showToast('All data cleared.', 'warning');
        
        // Emit event for storage controller
        this.emit('clearAllData');
    }

    async handleDownloadData() {
        try {
            this.showToast('Preparing download...', 'info');
            
            // Request data from storage controller
            const data = await this.requestData();
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `focus-bubble-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Data downloaded successfully!', 'success');
        } catch (error) {
            console.error('Download failed:', error);
            this.showToast('Download failed. Please try again.', 'error');
        }
    }

    /* ==========================================================================
       UI Update Methods
       ========================================================================== */

    updateTimer(seconds) {
        this.state.currentTime = seconds;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        this.elements.timerDisplay.textContent = timeString;
        
        // Update page title
        if (this.state.isSessionActive && !this.state.isPaused) {
            document.title = `${timeString} - Focus Bubble`;
        } else {
            document.title = 'Focus Bubble - Distraction Tracker';
        }
    }

    updateDistractionCount(count) {
        this.state.distractionCount = count;
        this.elements.distractionCount.textContent = count;
        
        // Animate counter change
        this.elements.distractionCount.classList.remove('animate');
        // Force reflow
        this.elements.distractionCount.offsetHeight;
        this.elements.distractionCount.classList.add('animate');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            this.elements.distractionCount.classList.remove('animate');
        }, 600);
    }

    updateSessionStatus(status) {
        this.elements.sessionStatus.textContent = status;
    }

    updateFocusStatus(isFocused) {
        const statusElement = this.elements.focusStatus;
        const icon = statusElement.querySelector('i');
        const text = statusElement.querySelector('span');
        
        if (isFocused) {
            statusElement.className = 'focus-status focused';
            icon.className = 'fas fa-check-circle';
            text.textContent = 'Focused';
        } else {
            statusElement.className = 'focus-status distracted';
            icon.className = 'fas fa-exclamation-triangle';
            text.textContent = 'Distracted';
            
            // Play sound if not muted
            if (!this.state.isMuted) {
                this.playNotificationSound();
            }
        }
    }

    updateButtonStates() {
        // Start button
        this.elements.startBtn.disabled = this.state.isSessionActive;
        
        // Pause button
        this.elements.pauseBtn.disabled = !this.state.isSessionActive || this.state.isPaused;
        
        // Resume button
        this.elements.resumeBtn.disabled = !this.state.isPaused;
        
        // Reset button is always enabled
        
        // Download button
        this.elements.downloadBtn.disabled = false;
    }

    updateStatistics(stats) {
        if (stats.totalTime !== undefined) {
            const minutes = Math.floor(stats.totalTime / 60);
            const seconds = stats.totalTime % 60;
            this.elements.totalTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (stats.focusRate !== undefined) {
            this.elements.focusRate.textContent = `${Math.round(stats.focusRate)}%`;
        }
        
        if (stats.sessionCount !== undefined) {
            this.elements.sessionCount.textContent = stats.sessionCount;
        }
    }

    animateTimerDisplay(active) {
        if (active) {
            this.elements.timerDisplay.parentElement.classList.add('active');
        } else {
            this.elements.timerDisplay.parentElement.classList.remove('active');
        }
    }

    /* ==========================================================================
       Theme Management
       ========================================================================== */

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.state.theme);
        
        // Update theme toggle icon
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = this.state.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        // Save theme preference
        localStorage.setItem('focusBubble_theme', this.state.theme);
        
        this.showToast(`Switched to ${this.state.theme} theme`, 'info');
    }

    /* ==========================================================================
       Audio Management
       ========================================================================== */

    toggleMute() {
        this.state.isMuted = !this.state.isMuted;
        
        const icon = this.elements.muteBtn.querySelector('i');
        if (this.state.isMuted) {
            icon.className = 'fas fa-volume-mute';
            this.elements.muteBtn.classList.add('muted');
        } else {
            icon.className = 'fas fa-volume-up';
            this.elements.muteBtn.classList.remove('muted');
        }
        
        // Save mute preference
        localStorage.setItem('focusBubble_muted', this.state.isMuted);
        
        this.showToast(this.state.isMuted ? 'Sounds muted' : 'Sounds enabled', 'info');
    }

    updateVolume(value) {
        this.state.volume = parseInt(value);
        this.elements.volumeDisplay.textContent = `${this.state.volume}%`;
        
        // Update mute button icon based on volume
        const icon = this.elements.muteBtn.querySelector('i');
        if (!this.state.isMuted) {
            if (this.state.volume === 0) {
                icon.className = 'fas fa-volume-off';
            } else if (this.state.volume < 50) {
                icon.className = 'fas fa-volume-down';
            } else {
                icon.className = 'fas fa-volume-up';
            }
        }
        
        // Save volume preference
        localStorage.setItem('focusBubble_volume', this.state.volume);
    }

    playNotificationSound() {
        if (this.state.isMuted || this.state.volume === 0) return;
        
        // Create audio context for notification sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(this.state.volume / 100 * 0.3, audioContext.currentTime);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.warn('Audio notification not supported:', error);
        }
    }

    playDistractionAudio() {
        if (this.state.isMuted || this.state.volume === 0) return;
        
        try {
            // Set volume based on user preference
            this.elements.distractionAudio.volume = this.state.volume / 100;
            
            // Reset audio to beginning and play
            this.elements.distractionAudio.currentTime = 0;
            const playPromise = this.elements.distractionAudio.play();
            
            // Handle promise-based play() method
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Audio playback failed:', error);
                    // Fallback to notification sound if mp3 fails
                    this.playNotificationSound();
                });
            }
        } catch (error) {
            console.warn('Distraction audio not supported:', error);
            // Fallback to notification sound
            this.playNotificationSound();
        }
    }

    /* ==========================================================================
       Help Modal Management
       ========================================================================== */

    toggleHelp() {
        if (this.elements.helpModal.classList.contains('hidden')) {
            this.showHelp();
        } else {
            this.hideHelp();
        }
    }

    showHelp() {
        this.elements.helpModal.classList.remove('hidden');
        // Focus the close button for accessibility
        setTimeout(() => {
            this.elements.closeHelp.focus();
        }, 100);
    }

    hideHelp() {
        this.elements.helpModal.classList.add('hidden');
    }

    /* ==========================================================================
       Toast Notifications
       ========================================================================== */

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    getToastIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-times-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /* ==========================================================================
       Keyboard Shortcuts
       ========================================================================== */

    handleKeyboard(event) {
        // Don't trigger shortcuts if user is typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Don't trigger if help modal is open and it's not the escape key
        if (!this.elements.helpModal.classList.contains('hidden') && event.key !== 'Escape') {
            return;
        }
        
        switch (event.key.toLowerCase()) {
            case ' ': // Space - Pause/Resume
                event.preventDefault();
                if (this.state.isSessionActive && !this.state.isPaused) {
                    this.handlePauseSession();
                } else if (this.state.isPaused) {
                    this.handleResumeSession();
                }
                break;
                
            case 'r': // R - Reset
                event.preventDefault();
                this.handleResetSession();
                break;
                
            case 'm': // M - Mute/Unmute
                event.preventDefault();
                this.toggleMute();
                break;
                
            case 'h': // H - Help
                event.preventDefault();
                this.toggleHelp();
                break;
                
            case 't': // T - Theme
                event.preventDefault();
                this.toggleTheme();
                break;
                
            case 'escape': // Escape - Close modals
                if (!this.elements.helpModal.classList.contains('hidden')) {
                    this.hideHelp();
                }
                break;
        }
    }

    /* ==========================================================================
       Distraction Detection
       ========================================================================== */

    handleVisibilityChange() {
        if (document.hidden && this.state.isSessionActive && !this.state.isPaused) {
            this.emit('distraction', 'tab_switch');
        }
    }

    handleWindowBlur() {
        if (this.state.isSessionActive && !this.state.isPaused) {
            this.emit('distraction', 'window_blur');
        }
    }

    handleWindowFocus() {
        // Window regained focus - could update focus status
        if (this.state.isSessionActive && !this.state.isPaused) {
            this.updateFocusStatus(true);
        }
    }

    /* ==========================================================================
       State Management
       ========================================================================== */

    saveState() {
        const stateToSave = {
            isSessionActive: this.state.isSessionActive,
            isPaused: this.state.isPaused,
            currentTime: this.state.currentTime,
            distractionCount: this.state.distractionCount,
            timestamp: Date.now()
        };
        
        localStorage.setItem('focusBubble_sessionState', JSON.stringify(stateToSave));
    }

    restoreState() {
        try {
            const savedState = localStorage.getItem('focusBubble_sessionState');
            if (!savedState) return;
            
            const state = JSON.parse(savedState);
            const timeDiff = Date.now() - state.timestamp;
            
            // Only restore if session was saved less than 1 hour ago
            if (timeDiff < 3600000) {
                this.state.isSessionActive = state.isSessionActive;
                this.state.isPaused = state.isPaused;
                this.state.currentTime = state.currentTime;
                this.state.distractionCount = state.distractionCount;
                
                this.updateTimer(this.state.currentTime);
                this.updateDistractionCount(this.state.distractionCount);
                this.updateButtonStates();
                
                if (this.state.isSessionActive) {
                    this.updateSessionStatus(this.state.isPaused ? 'Session Paused' : 'Session Restored');
                    this.showToast('Session restored from previous visit', 'info');
                }
            }
        } catch (error) {
            console.warn('Failed to restore session state:', error);
        }
    }

    loadSettings() {
        // Load theme
        const savedTheme = localStorage.getItem('focusBubble_theme') || 'light';
        this.state.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeIcon = this.elements.themeToggle.querySelector('i');
        themeIcon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        // Load audio settings
        const savedMuted = localStorage.getItem('focusBubble_muted') === 'true';
        const savedVolume = parseInt(localStorage.getItem('focusBubble_volume')) || 50;
        
        this.state.isMuted = savedMuted;
        this.state.volume = savedVolume;
        
        this.elements.volumeSlider.value = savedVolume;
        this.updateVolume(savedVolume);
        
        if (savedMuted) {
            this.toggleMute();
        }
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.showToast('Welcome to Focus Bubble! Press H for help.', 'info', 5000);
        }, 1000);
    }

    /* ==========================================================================
       Event System for Communication with Other Controllers
       ========================================================================== */

    emit(eventType, data = null) {
        const event = new CustomEvent(`focusBubble:${eventType}`, { 
            detail: data 
        });
        document.dispatchEvent(event);
    }

    on(eventType, callback) {
        document.addEventListener(`focusBubble:${eventType}`, callback);
    }

    /* ==========================================================================
       Data Request Method (for download functionality)
       ========================================================================== */

    async requestData() {
        return new Promise((resolve) => {
            // Create event to request data from storage controller
            const event = new CustomEvent('focusBubble:requestData', {
                detail: { callback: resolve }
            });
            document.dispatchEvent(event);
            
            // Fallback data if no storage controller responds
            setTimeout(() => {
                resolve({
                    metadata: {
                        exportDate: new Date().toISOString(),
                        version: '1.0.0',
                        source: 'Focus Bubble - Distraction Tracker'
                    },
                    currentSession: {
                        isActive: this.state.isSessionActive,
                        isPaused: this.state.isPaused,
                        currentTime: this.state.currentTime,
                        distractionCount: this.state.distractionCount
                    },
                    sessions: [],
                    statistics: {
                        totalSessions: 0,
                        totalTime: this.state.currentTime,
                        totalDistractions: this.state.distractionCount,
                        averageFocusRate: 100
                    }
                });
            }, 1000);
        });
    }

    /* ==========================================================================
       Public API Methods
       ========================================================================== */

    // Method to be called by timer controller
    onTimerUpdate(seconds) {
        this.updateTimer(seconds);
    }

    // Method to be called by distraction controller
    onDistractionDetected(count) {
        this.updateDistractionCount(count);
        this.updateFocusStatus(false);
        
        // Play distraction audio when a new distraction is detected
        if (count > 0) {
            this.playDistractionAudio();
        }
        
        // Return to focused state after a delay
        setTimeout(() => {
            if (this.state.isSessionActive && !this.state.isPaused) {
                this.updateFocusStatus(true);
            }
        }, 2000);
    }

    // Method to be called by storage controller with statistics
    onStatisticsUpdate(stats) {
        this.updateStatistics(stats);
    }

    // Method to get current UI state
    getState() {
        return { ...this.state };
    }
}

/* ==========================================================================
   Initialize UI Controller
   ========================================================================== */

// Initialize UI controller when DOM is loaded
let uiController;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        uiController = new UIController();
        window.focusBubbleUI = uiController;
    });
} else {
    uiController = new UIController();
    window.focusBubbleUI = uiController;
}

/* ==========================================================================
   Export for module systems
   ========================================================================== */

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
