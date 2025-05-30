/* ==========================================================================
   Focus Bubble - Storage Controller
   Handles data persistence and session history
   ========================================================================== */

class StorageController {
    constructor() {
        this.storageKey = 'focusBubble';
        this.currentSession = null;
        this.sessions = [];
        this.statistics = {
            totalSessions: 0,
            totalTime: 0,
            totalDistractions: 0,
            averageFocusRate: 100
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.updateStatistics();
    }

    bindEvents() {
        // Listen for session events
        document.addEventListener('focusBubble:sessionStart', () => this.startSession());
        document.addEventListener('focusBubble:sessionReset', () => this.resetCurrentSession());
        document.addEventListener('focusBubble:clearAllData', () => this.clearAllData());
        
        // Listen for timer updates
        document.addEventListener('focusBubble:timerUpdate', (e) => this.updateSessionTime(e.detail));
        
        // Listen for distraction events
        document.addEventListener('focusBubble:distractionRecorded', (e) => this.recordDistraction(e.detail));
        
        // Listen for data requests
        document.addEventListener('focusBubble:requestData', (e) => this.handleDataRequest(e.detail.callback));
        
        // Auto-save periodically
        setInterval(() => this.saveData(), 30000); // Save every 30 seconds
        
        // Save on page unload
        window.addEventListener('beforeunload', () => this.saveSession());
    }

    startSession() {
        // Save previous session if it exists
        if (this.currentSession) {
            this.saveSession();
        }
        
        // Create new session
        this.currentSession = {
            id: this.generateSessionId(),
            startTime: Date.now(),
            endTime: null,
            duration: 0,
            distractions: [],
            distractionCount: 0,
            focusRate: 100,
            isCompleted: false
        };
        
        console.log('New session started:', this.currentSession.id);
    }

    updateSessionTime(data) {
        if (this.currentSession) {
            this.currentSession.duration = data.seconds * 1000; // Store in milliseconds
            
            // Update UI statistics
            if (window.focusBubbleUI) {
                window.focusBubbleUI.onStatisticsUpdate({
                    totalTime: this.statistics.totalTime + data.seconds,
                    sessionCount: this.statistics.totalSessions + (this.currentSession ? 1 : 0)
                });
            }
        }
    }

    recordDistraction(distractionData) {
        if (this.currentSession) {
            this.currentSession.distractions.push(distractionData);
            this.currentSession.distractionCount = this.currentSession.distractions.length;
            
            // Calculate focus rate for current session
            this.updateSessionFocusRate();
        }
    }

    updateSessionFocusRate() {
        if (!this.currentSession) return;
        
        const sessionDuration = this.currentSession.duration / (1000 * 60); // Convert to minutes
        
        if (sessionDuration < 1) {
            this.currentSession.focusRate = 100;
            return;
        }
        
        const distractionsPerMinute = this.currentSession.distractionCount / sessionDuration;
        
        // Calculate focus rate (fewer distractions = higher focus rate)
        const focusRate = Math.max(0, Math.min(100, 100 - (distractionsPerMinute * 50)));
        this.currentSession.focusRate = Math.round(focusRate);
        
        // Update UI
        if (window.focusBubbleUI) {
            window.focusBubbleUI.onStatisticsUpdate({
                focusRate: this.currentSession.focusRate
            });
        }
    }

    saveSession() {
        if (this.currentSession && this.currentSession.duration > 0) {
            // Mark session as completed
            this.currentSession.endTime = Date.now();
            this.currentSession.isCompleted = true;
            
            // Add to sessions array
            this.sessions.push({ ...this.currentSession });
            
            // Update overall statistics
            this.updateStatistics();
            
            // Save to localStorage
            this.saveData();
            
            console.log('Session saved:', this.currentSession.id);
        }
    }

    resetCurrentSession() {
        if (this.currentSession && this.currentSession.duration > 5000) { // Save if session was longer than 5 seconds
            this.saveSession();
        }
        
        this.currentSession = null;
        console.log('Current session reset');
    }

    updateStatistics() {
        const completedSessions = this.sessions.filter(session => session.isCompleted);
        
        this.statistics.totalSessions = completedSessions.length;
        this.statistics.totalTime = completedSessions.reduce((total, session) => total + (session.duration / 1000), 0);
        this.statistics.totalDistractions = completedSessions.reduce((total, session) => total + session.distractionCount, 0);
        
        if (completedSessions.length > 0) {
            this.statistics.averageFocusRate = Math.round(
                completedSessions.reduce((total, session) => total + session.focusRate, 0) / completedSessions.length
            );
        } else {
            this.statistics.averageFocusRate = 100;
        }
        
        // Update UI
        if (window.focusBubbleUI) {
            window.focusBubbleUI.onStatisticsUpdate({
                totalTime: Math.floor(this.statistics.totalTime),
                focusRate: this.statistics.averageFocusRate,
                sessionCount: this.statistics.totalSessions
            });
        }
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    saveData() {
        const dataToSave = {
            sessions: this.sessions,
            statistics: this.statistics,
            currentSession: this.currentSession,
            lastSaved: Date.now(),
            version: '1.0.0'
        };
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Failed to save data to localStorage:', error);
        }
    }

    loadData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                
                this.sessions = data.sessions || [];
                this.statistics = { ...this.statistics, ...data.statistics };
                
                // Don't restore current session if it's too old (more than 1 hour)
                if (data.currentSession && data.lastSaved && (Date.now() - data.lastSaved < 3600000)) {
                    this.currentSession = data.currentSession;
                    console.log('Session restored from storage');
                }
                
                console.log('Data loaded from storage');
            }
        } catch (error) {
            console.error('Failed to load data from localStorage:', error);
        }
    }

    clearAllData() {
        this.sessions = [];
        this.currentSession = null;
        this.statistics = {
            totalSessions: 0,
            totalTime: 0,
            totalDistractions: 0,
            averageFocusRate: 100
        };
        
        // Clear localStorage
        localStorage.removeItem(this.storageKey);
        
        // Update UI
        this.updateStatistics();
        
        console.log('All data cleared');
    }

    handleDataRequest(callback) {
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                version: '1.0.0',
                source: 'Focus Bubble - Distraction Tracker',
                totalSessions: this.statistics.totalSessions
            },
            currentSession: this.currentSession,
            sessions: this.sessions.map(session => ({
                ...session,
                startTime: new Date(session.startTime).toISOString(),
                endTime: session.endTime ? new Date(session.endTime).toISOString() : null,
                durationMinutes: Math.round(session.duration / (1000 * 60) * 100) / 100,
                distractions: session.distractions.map(distraction => ({
                    ...distraction,
                    timestamp: new Date(distraction.timestamp).toISOString(),
                    sessionTimeMinutes: Math.round(distraction.sessionTime / (1000 * 60) * 100) / 100
                }))
            })),
            statistics: {
                ...this.statistics,
                totalTimeHours: Math.round(this.statistics.totalTime / 3600 * 100) / 100,
                averageSessionLength: this.statistics.totalSessions > 0 
                    ? Math.round((this.statistics.totalTime / this.statistics.totalSessions) / 60 * 100) / 100 
                    : 0,
                averageDistractionsPerSession: this.statistics.totalSessions > 0 
                    ? Math.round((this.statistics.totalDistractions / this.statistics.totalSessions) * 100) / 100 
                    : 0
            },
            insights: this.generateInsights()
        };
        
        callback(exportData);
    }

    generateInsights() {
        const insights = [];
        
        if (this.sessions.length === 0) {
            insights.push("No completed sessions yet. Start your first session to see insights!");
            return insights;
        }
        
        // Focus rate insights
        if (this.statistics.averageFocusRate >= 90) {
            insights.push("🎯 Excellent! Your focus rate is outstanding.");
        } else if (this.statistics.averageFocusRate >= 70) {
            insights.push("👍 Good focus rate! Room for improvement.");
        } else {
            insights.push("📈 Focus rate could be improved. Try reducing distractions.");
        }
        
        // Session length insights
        const avgSessionLength = this.statistics.totalTime / this.statistics.totalSessions / 60;
        if (avgSessionLength >= 25) {
            insights.push("⏰ Great session lengths! You're building good focus habits.");
        } else if (avgSessionLength >= 15) {
            insights.push("⏱️ Consider longer sessions for deeper focus (25+ minutes).");
        } else {
            insights.push("⚡ Try gradually increasing your session length.");
        }
        
        // Distraction patterns
        const avgDistractions = this.statistics.totalDistractions / this.statistics.totalSessions;
        if (avgDistractions <= 2) {
            insights.push("🛡️ Excellent distraction control!");
        } else if (avgDistractions <= 5) {
            insights.push("⚠️ Moderate distractions. Consider removing potential interruptions.");
        } else {
            insights.push("🚨 High distraction rate. Try turning off notifications.");
        }
        
        return insights;
    }

    // Public API methods
    getStatistics() {
        return { ...this.statistics };
    }

    getSessions() {
        return [...this.sessions];
    }

    getCurrentSession() {
        return this.currentSession ? { ...this.currentSession } : null;
    }

    exportSessionData(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        return session ? { ...session } : null;
    }
}

// Initialize storage controller
let storageController;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        storageController = new StorageController();
        window.focusBubbleStorage = storageController;
    });
} else {
    storageController = new StorageController();
    window.focusBubbleStorage = storageController;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageController;
}
