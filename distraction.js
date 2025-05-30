/* ==========================================================================
   Focus Bubble - Distraction Controller
   Handles distraction detection and tracking
   ========================================================================== */

class DistractionController {
    constructor() {
        this.distractionCount = 0;
        this.sessionStartTime = null;
        this.isSessionActive = false;
        this.lastDistractionTime = 0;
        this.distractionTypes = {
            TAB_SWITCH: 'tab_switch',
            WINDOW_BLUR: 'window_blur',
            MANUAL: 'manual'
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupVisibilityDetection();
    }

    bindEvents() {
        // Listen for UI events
        document.addEventListener('focusBubble:sessionStart', () => this.startTracking());
        document.addEventListener('focusBubble:sessionPause', () => this.pauseTracking());
        document.addEventListener('focusBubble:sessionResume', () => this.resumeTracking());
        document.addEventListener('focusBubble:sessionReset', () => this.resetTracking());
        document.addEventListener('focusBubble:distraction', (e) => this.handleDistraction(e.detail));
    }

    setupVisibilityDetection() {
        // Page Visibility API
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isSessionActive) {
                this.recordDistraction(this.distractionTypes.TAB_SWITCH);
            }
        });

        // Window focus/blur events
        window.addEventListener('blur', () => {
            if (this.isSessionActive) {
                this.recordDistraction(this.distractionTypes.WINDOW_BLUR);
            }
        });

        // Mouse leave detection (when cursor leaves the window)
        document.addEventListener('mouseleave', (e) => {
            if (this.isSessionActive && e.clientY < 0) {
                // Cursor left through the top (likely switching to another app)
                this.recordDistraction(this.distractionTypes.TAB_SWITCH);
            }
        });
    }

    startTracking() {
        this.isSessionActive = true;
        this.sessionStartTime = Date.now();
        this.distractionCount = 0;
        console.log('Distraction tracking started');
    }

    pauseTracking() {
        this.isSessionActive = false;
        console.log('Distraction tracking paused');
    }

    resumeTracking() {
        this.isSessionActive = true;
        console.log('Distraction tracking resumed');
    }

    resetTracking() {
        this.isSessionActive = false;
        this.distractionCount = 0;
        this.sessionStartTime = null;
        this.lastDistractionTime = 0;
        
        // Update UI
        if (window.focusBubbleUI) {
            window.focusBubbleUI.onDistractionDetected(0);
        }
        
        console.log('Distraction tracking reset');
    }

    handleDistraction(type) {
        if (this.isSessionActive) {
            this.recordDistraction(type);
        }
    }

    recordDistraction(type = this.distractionTypes.MANUAL) {
        const now = Date.now();
        
        // Prevent duplicate distractions within 2 seconds
        if (now - this.lastDistractionTime < 2000) {
            return;
        }
        
        this.lastDistractionTime = now;
        this.distractionCount++;
        
        const distractionData = {
            timestamp: now,
            type: type,
            sessionTime: this.sessionStartTime ? now - this.sessionStartTime : 0
        };
        
        // Update UI
        if (window.focusBubbleUI) {
            window.focusBubbleUI.onDistractionDetected(this.distractionCount);
        }
        
        // Emit event for storage
        document.dispatchEvent(new CustomEvent('focusBubble:distractionRecorded', {
            detail: distractionData
        }));
        
        console.log(`Distraction recorded: ${type} (Total: ${this.distractionCount})`);
    }

    // Manual distraction recording (for testing or manual tracking)
    addManualDistraction() {
        this.recordDistraction(this.distractionTypes.MANUAL);
    }

    getDistractionCount() {
        return this.distractionCount;
    }

    getFocusRate() {
        if (!this.sessionStartTime) return 100;
        
        const sessionDuration = Date.now() - this.sessionStartTime;
        const sessionMinutes = sessionDuration / (1000 * 60);
        
        if (sessionMinutes < 1) return 100;
        
        const distractionsPerMinute = this.distractionCount / sessionMinutes;
        
        // Calculate focus rate (fewer distractions = higher focus rate)
        // Assume 1 distraction per minute = 50% focus rate
        const focusRate = Math.max(0, Math.min(100, 100 - (distractionsPerMinute * 50)));
        
        return Math.round(focusRate);
    }

    getState() {
        return {
            distractionCount: this.distractionCount,
            isSessionActive: this.isSessionActive,
            sessionStartTime: this.sessionStartTime,
            focusRate: this.getFocusRate()
        };
    }

    getSessionStatistics() {
        return {
            totalDistractions: this.distractionCount,
            focusRate: this.getFocusRate(),
            sessionDuration: this.sessionStartTime ? Date.now() - this.sessionStartTime : 0
        };
    }
}

// Initialize distraction controller
let distractionController;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        distractionController = new DistractionController();
        window.focusBubbleDistraction = distractionController;
    });
} else {
    distractionController = new DistractionController();
    window.focusBubbleDistraction = distractionController;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DistractionController;
}
