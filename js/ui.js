/**
 * UI handling for the Groin Smashers game
 */

const UI = {
    init: function(game) {
        this.game = game;
        this.setupEventListeners();
        this.setupMenuButtons();
        this.notifications = [];
        this.notificationDuration = 3000; // 3 seconds
    },
    
    setupEventListeners: function() {
        // Game controls
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Resize handling
        window.addEventListener('resize', this.handleResize.bind(this));
    },
    
    setupMenuButtons: function() {
        // Main menu buttons
        document.getElementById('story-mode').addEventListener('click', () => {
            this.game.startStoryMode();
        });
        
        document.getElementById('challenge-mode').addEventListener('click', () => {
            this.game.startChallengeMode();
        });
        
        document.getElementById('multiplayer').addEventListener('click', () => {
            this.game.startMultiplayerMode();
        });
        
        document.getElementById('customize').addEventListener('click', () => {
            this.showCustomizationScreen();
        });
        
        // Level complete buttons
        document.getElementById('next-level').addEventListener('click', () => {
            this.game.loadNextLevel();
        });
        
        document.getElementById('retry-level').addEventListener('click', () => {
            this.game.restartLevel();
        });
        
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.game.showMainMenu();
        });
    },
    
    handleKeyDown: function(e) {
        // Only process keys if game is active
        if (!this.game.isActive) return;
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
                this.game.player.movingLeft = true;
                break;
                
            case 'ArrowRight':
            case 'd':
                this.game.player.movingRight = true;
                break;
                
            case 'ArrowUp':
            case 'w':
                if (this.game.player.canClimb) {
                    this.game.player.climb();
                } else {
                    this.game.player.jump();
                }
                break;
                
            case ' ': // Spacebar
                this.game.player.jump();
                break;
                
            case 'Escape':
                this.game.togglePause();
                break;
        }
    },
    
    handleKeyUp: function(e) {
        // Reset states on key up if needed
        if (!this.game.isActive) return;
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
                this.game.player.movingLeft = false;
                break;
                
            case 'ArrowRight':
            case 'd':
                this.game.player.movingRight = false;
                break;
                
            case 'ArrowUp':
            case 'w':
                this.game.player.climbing = false;
                break;
        }
    },
    
    handleResize: function() {
        // Adjust canvas size based on window size
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            // Maintain aspect ratio
            const container = document.querySelector('.game-container');
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            // Target aspect ratio is 4:3
            const targetRatio = 4 / 3;
            const currentRatio = containerWidth / containerHeight;
            
            if (currentRatio > targetRatio) {
                // Container is wider than needed
                canvas.style.height = '100%';
                canvas.style.width = 'auto';
            } else {
                // Container is taller than needed
                canvas.style.width = '100%';
                canvas.style.height = 'auto';
            }
        }
    },
    
    showScreen: function(screenId) {
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show the requested screen
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
        }
    },
    
    updateHUD: function(data) {
        // Update score
        const scoreElement = document.getElementById('score-value');
        if (scoreElement) {
            scoreElement.textContent = Utils.formatNumber(data.score);
        }
        
        // Update height
        const heightElement = document.getElementById('height-value');
        if (heightElement) {
            heightElement.textContent = data.height.toFixed(1);
        }
        
        // Update stunts
        const stuntsElement = document.getElementById('stunts-value');
        if (stuntsElement) {
            if (data.stunts && data.stunts.length > 0) {
                stuntsElement.textContent = data.stunts.map(s => s.name).join(', ');
            } else {
                stuntsElement.textContent = 'None';
            }
        }
    },
    
    showLevelComplete: function(data) {
        // Update level complete screen with stats
        document.getElementById('final-height').textContent = data.height.toFixed(1);
        document.getElementById('final-stunts').textContent = 
            data.stunts.length > 0 ? data.stunts.map(s => s.name).join(', ') : 'None';
        document.getElementById('final-impact').textContent = Math.floor(data.impact);
        document.getElementById('final-score').textContent = Utils.formatNumber(data.score);
        
        // Show the level complete screen
        this.showScreen('level-complete');
        
        // Check for unlocked stunts
        const newStunts = StuntManager.unlockStunts(data.totalScore);
        if (newStunts.length > 0) {
            this.showNotification(`New stunts unlocked: ${newStunts.map(s => s.name).join(', ')}`);
        }
        
        // Check for unlocked levels
        const newLevels = this.game.checkLevelUnlocks(data.totalScore);
        if (newLevels.length > 0) {
            this.showNotification(`New levels unlocked: ${newLevels.join(', ')}`);
        }
    },
    
    showCustomizationScreen: function() {
        // This would be implemented in a more complete version
        this.showNotification('Character customization coming soon!');
    },
    
    showNotification: function(message, duration) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Add to DOM
        document.querySelector('.game-container').appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Set timeout to remove
        const timeout = setTimeout(() => {
            notification.classList.remove('show');
            
            // Remove from DOM after animation
            setTimeout(() => {
                notification.remove();
                
                // Remove from notifications array
                const index = this.notifications.findIndex(n => n.element === notification);
                if (index !== -1) {
                    this.notifications.splice(index, 1);
                }
            }, 300);
        }, duration || this.notificationDuration);
        
        // Store notification
        this.notifications.push({
            element: notification,
            timeout: timeout
        });
    },
    
    clearNotifications: function() {
        // Clear all active notifications
        this.notifications.forEach(notification => {
            clearTimeout(notification.timeout);
            notification.element.remove();
        });
        
        this.notifications = [];
    },
    
    setupPauseMenu: function() {
        // Create pause menu container if it doesn't exist
        if (!this.pauseMenu) {
            this.pauseMenu = document.createElement('div');
            this.pauseMenu.className = 'pause-menu hidden';
            document.querySelector('.game-container').appendChild(this.pauseMenu);
            
            // Create pause menu content
            this.pauseMenu.innerHTML = `
                <div class="pause-menu-content">
                    <h2>PAUSED</h2>
                    <button id="resume-game">Resume Game</button>
                    <button id="restart-level">Restart Level</button>
                    <button id="exit-to-menu">Exit to Menu</button>
                </div>
            `;
            
            // Add event listeners for pause menu buttons
            document.getElementById('resume-game').addEventListener('click', () => {
                this.hidePauseMenu(); // Hide menu first
                this.game.togglePause(); // Then unpause
            });
            
            document.getElementById('restart-level').addEventListener('click', () => {
                this.hidePauseMenu(); // Hide menu first
                this.game.isPaused = false; // Force unpause
                this.game.restartLevel();
            });
            
            document.getElementById('exit-to-menu').addEventListener('click', () => {
                this.hidePauseMenu(); // Hide menu first
                this.game.isPaused = false; // Force unpause
                this.game.showMainMenu();
            });
        }
    },
    
    showPauseMenu: function() {
        if (!this.pauseMenu) {
            this.setupPauseMenu();
        }
        this.pauseMenu.classList.remove('hidden');
    },
    
    hidePauseMenu: function() {
        if (this.pauseMenu) {
            this.pauseMenu.classList.add('hidden');
        }
    },
    
    drawPauseOverlay: function(ctx) {
        // Draw semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Show the pause menu UI
        this.showPauseMenu();
    },
    
    drawStaminaBar: function(ctx, player) {
        // Draw stamina bar in the top right
        const barWidth = 150;
        const barHeight = 15;
        const x = ctx.canvas.width - barWidth - 20;
        const y = 20;
        
        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw stamina level
        const staminaPercent = player.stamina / player.maxStamina;
        ctx.fillStyle = staminaPercent > 0.6 ? '#4CAF50' : staminaPercent > 0.3 ? '#FFC107' : '#F44336';
        ctx.fillRect(x, y, barWidth * staminaPercent, barHeight);
        
        // Draw border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Draw label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('STAMINA', x + barWidth / 2, y - 5);
    },
    
    drawStuntCombo: function(ctx, keyBuffer, comboTimeWindow, lastKeyTime) {
        // Draw current key combo in the bottom right
        if (keyBuffer.length === 0) return;
        
        const x = ctx.canvas.width - 20;
        const y = ctx.canvas.height - 20;
        const keySize = 30;
        const spacing = 5;
        
        // Calculate time remaining in combo window
        const currentTime = Date.now();
        const timeElapsed = currentTime - lastKeyTime;
        const timeRemaining = comboTimeWindow - timeElapsed;
        const percentRemaining = Math.max(0, timeRemaining / comboTimeWindow);
        
        // Draw keys in reverse order (most recent on the right)
        for (let i = keyBuffer.length - 1; i >= 0; i--) {
            const key = keyBuffer[i];
            const keyX = x - (keyBuffer.length - i) * (keySize + spacing);
            
            // Draw key background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(keyX - keySize, y - keySize, keySize, keySize);
            
            // Draw key border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(keyX - keySize, y - keySize, keySize, keySize);
            
            // Draw key symbol
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            let symbol = '';
            switch (key) {
                case 'ArrowUp':
                    symbol = '↑';
                    break;
                case 'ArrowDown':
                    symbol = '↓';
                    break;
                case 'ArrowLeft':
                    symbol = '←';
                    break;
                case 'ArrowRight':
                    symbol = '→';
                    break;
                default:
                    symbol = key;
            }
            
            ctx.fillText(symbol, keyX - keySize / 2, y - keySize / 2);
        }
        
        // Draw combo timer bar
        const barWidth = (keyBuffer.length * (keySize + spacing)) - spacing;
        const barHeight = 3;
        const barX = x - barWidth;
        const barY = y - keySize - 5;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Timer
        ctx.fillStyle = percentRemaining > 0.6 ? '#4CAF50' : percentRemaining > 0.3 ? '#FFC107' : '#F44336';
        ctx.fillRect(barX, barY, barWidth * percentRemaining, barHeight);
    },
    
    drawTutorialText: function(ctx, text, x, y) {
        // Draw tutorial text with a background for better visibility
        const padding = 10;
        const textWidth = ctx.measureText(text).width;
        
        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - padding, y - 20, textWidth + padding * 2, 30);
        
        // Draw text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
    }
};
