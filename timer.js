/* ==========================================================================
   Focus Bubble - Timer Controller
   Handles session timing and timer functionality
   ========================================================================== */

class TimerController {
    constructor() {
        this.startTime = null;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.timerInterval = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Listen for UI events
        document.addEventListener('focusBubble:sessionStart', () => this.startTimer());
        document.addEventListener('focusBubble:sessionPause', () => this.pauseTimer());
        document.addEventListener('focusBubble:sessionResume', () => this.resumeTimer());
        document.addEventListener('focusBubble:sessionReset', () => this.resetTimer());
    }

    startTimer() {
        this.startTime = Date.now() - this.elapsedTime;
        this.isRunning = true;
        this.isPaused = false;
        
        this.timerInterval = setInterval(() => {
            this.updateElapsedTime();
        }, 1000);
        
        console.log('Timer started');
    }

    pauseTimer() {
        this.isRunning = false;
        this.isPaused = true;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        console.log('Timer paused');
    }

    resumeTimer() {
        this.startTime = Date.now() - this.elapsedTime;
        this.isRunning = true;
        this.isPaused = false;
        
        this.timerInterval = setInterval(() => {
            this.updateElapsedTime();
        }, 1000);
        
        console.log('Timer resumed');
    }

    resetTimer() {
        this.isRunning = false;
        this.isPaused = false;
        this.elapsedTime = 0;
        this.startTime = null;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Update UI
        if (window.focusBubbleUI) {
            window.focusBubbleUI.onTimerUpdate(0);
        }
        
        console.log('Timer reset');
    }

    updateElapsedTime() {
        if (this.isRunning && this.startTime) {
            this.elapsedTime = Date.now() - this.startTime;
            const seconds = Math.floor(this.elapsedTime / 1000);
            
            // Update UI
            if (window.focusBubbleUI) {
                window.focusBubbleUI.onTimerUpdate(seconds);
            }
            
            // Emit event for storage
            document.dispatchEvent(new CustomEvent('focusBubble:timerUpdate', {
                detail: { seconds, elapsedTime: this.elapsedTime }
            }));
        }
    }

    getCurrentTime() {
        return Math.floor(this.elapsedTime / 1000);
    }

    getState() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            elapsedTime: this.elapsedTime,
            currentTime: this.getCurrentTime()
        };
    }
}

// Initialize timer controller
let timerController;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        timerController = new TimerController();
        window.focusBubbleTimer = timerController;
    });
} else {
    timerController = new TimerController();
    window.focusBubbleTimer = timerController;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimerController;
}
