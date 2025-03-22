/**
 * Main game logic for the Groin Smashers game
 */

const Game = {
    init: function() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Initialize game state
        this.isActive = false;
        this.isPaused = false;
        this.gameMode = null;
        this.currentLevel = null;
        this.player = null;
        this.score = 0;
        this.totalScore = 0;
        this.highScores = this.loadHighScores();
        this.sounds = {};
        
        // Initialize game components
        Physics.init(this);
        UI.init(this);
        
        // Load sounds
        this.loadSounds();
        
        // Start the game loop
        this.lastTime = 0;
        requestAnimationFrame(this.gameLoop.bind(this));
        
        // Show the main menu
        this.showMainMenu();
    },
    
    gameLoop: function(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and render the game
        if (this.isActive && !this.isPaused) {
            this.update(deltaTime);
        }
        
        this.render();
        
        // Continue the game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    },
    
    update: function(deltaTime) {
        // Update physics
        Physics.update();
        
        // Update player
        if (this.player) {
            this.player.update();
            
            // Update HUD
            UI.updateHUD({
                score: this.score,
                height: this.player.currentHeight,
                stunts: this.player.currentStunts
            });
            
            // Check for level completion - only when player hits the ground at the bottom
            if (this.player.hitGroin && this.isPlayerAtBottom()) {
                console.log("Player hit bottom - completing level!");
                this.handleLevelComplete();
            }
        }
    },
    
    // Check if player is at the bottom of the level (near the ground)
    isPlayerAtBottom: function() {
        if (!this.player || !this.currentLevel) return false;
        
        // Calculate distance from ground
        const distanceFromGround = Math.abs(this.currentLevel.groundY - this.player.y);
        
        // Consider the player at the bottom if they're within 100 pixels of the ground
        return distanceFromGround < 100;
    },
    
    // Camera properties
    camera: {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        followPlayer: true
    },
    
    // Score animation properties
    scoreAnimation: {
        active: false,
        value: 0,
        targetValue: 0,
        shakeIntensity: 0,
        shakeDecay: 0.9,
        lastUpdateTime: 0
    },
    
    // Level completion delay
    levelCompleteDelay: 3000, // 3 seconds
    levelCompleteTimer: null,
    
    render: function() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update camera position to follow player
        if (this.player && this.camera.followPlayer) {
            // Target Y position - keep player in upper third of screen
            const targetY = this.player.y - this.canvas.height / 3;
            
            // Clamp camera position to level bounds
            const maxY = this.currentLevel ? this.currentLevel.height - this.canvas.height : 0;
            this.camera.y = Math.max(0, Math.min(targetY, maxY));
        }
        
        // Save the context state
        this.ctx.save();
        
        // Translate context to camera position
        this.ctx.translate(0, -this.camera.y);
        
        // Render the current level
        if (this.currentLevel) {
            this.currentLevel.draw(this.ctx);
        }
        
        // Render the player
        if (this.player) {
            this.player.draw(this.ctx);
        }
        
        // Restore the context state
        this.ctx.restore();
        
        // Draw UI elements (not affected by camera)
        if (this.player) {
            // Draw stamina bar
            UI.drawStaminaBar(this.ctx, this.player);
            
            // Draw stunt combo display
            if (StuntManager.keyBuffer && StuntManager.keyBuffer.length > 0) {
                UI.drawStuntCombo(
                    this.ctx, 
                    StuntManager.keyBuffer, 
                    StuntManager.comboTimeWindow, 
                    StuntManager.lastKeyTime
                );
            }
            
            // Draw real-time score with effects
            this.drawScoreWithEffects();
        }
        
        // Draw pause overlay if paused
        if (this.isPaused) {
            UI.drawPauseOverlay(this.ctx);
        }
    },
    
    drawScoreWithEffects: function() {
        // Update score animation
        if (this.scoreAnimation.active) {
            const now = Date.now();
            const deltaTime = now - this.scoreAnimation.lastUpdateTime;
            
            // Animate score value
            if (this.scoreAnimation.value < this.scoreAnimation.targetValue) {
                // Increment score value
                const increment = Math.ceil((this.scoreAnimation.targetValue - this.scoreAnimation.value) * 0.1);
                this.scoreAnimation.value += increment;
                
                // Apply shake effect
                this.scoreAnimation.shakeIntensity = Math.min(10, this.scoreAnimation.shakeIntensity + increment * 0.05);
                
                // Cap at target value
                if (this.scoreAnimation.value > this.scoreAnimation.targetValue) {
                    this.scoreAnimation.value = this.scoreAnimation.targetValue;
                }
            } else {
                // Decay shake effect
                this.scoreAnimation.shakeIntensity *= this.scoreAnimation.shakeDecay;
                
                // Deactivate animation when shake is minimal
                if (this.scoreAnimation.shakeIntensity < 0.1) {
                    this.scoreAnimation.shakeIntensity = 0;
                    this.scoreAnimation.active = false;
                }
            }
            
            this.scoreAnimation.lastUpdateTime = now;
        }
        
        // Draw score with shake effect
        const scoreText = `SCORE: ${Utils.formatNumber(this.scoreAnimation.value)}`;
        
        // Apply shake effect
        const shakeX = (Math.random() * 2 - 1) * this.scoreAnimation.shakeIntensity;
        const shakeY = (Math.random() * 2 - 1) * this.scoreAnimation.shakeIntensity;
        
        // Draw score text with glow effect
        this.ctx.save();
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        
        // Draw glow
        this.ctx.shadowColor = '#FF4081';
        this.ctx.shadowBlur = 10 + this.scoreAnimation.shakeIntensity * 2;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(scoreText, this.canvas.width / 2 + shakeX, 40 + shakeY);
        
        this.ctx.restore();
    },
    
    showMainMenu: function() {
        // Reset game state
        this.isActive = false;
        this.isPaused = false;
        this.gameMode = null;
        this.score = 0;
        
        // Clear the world
        Physics.reset();
        
        // Show the menu screen
        UI.showScreen('menu');
    },
    
    startStoryMode: function() {
        this.gameMode = 'story';
        this.totalScore = 0;
        
        // Load the first level
        this.loadLevel('supplyRoom');
    },
    
    startChallengeMode: function() {
        this.gameMode = 'challenge';
        
        // In challenge mode, player can select any unlocked level
        // For now, just load the first level
        this.loadLevel('supplyRoom');
    },
    
    startMultiplayerMode: function() {
        // This would be implemented in a more complete version
        UI.showNotification('Multiplayer mode coming soon!');
    },
    
    loadLevel: function(levelId) {
        // Clear the world
        Physics.reset();
        
        // Get the level
        this.currentLevel = Levels[levelId];
        
        if (!this.currentLevel) {
            console.error(`Level ${levelId} not found`);
            return;
        }
        
        // Create physics for the level
        this.currentLevel.createPhysics(Physics.world);
        
        // Create the player
        this.createPlayer();
        
        // Set gravity based on level
        Physics.applyGravity(this.currentLevel.gravity || 1);
        
        // Reset score for this level
        this.score = 0;
        
        // Activate the game
        this.isActive = true;
        this.isPaused = false;
        
        // Show the game screen
        UI.showScreen('game');
        
        // Play level music
        this.playSound('levelMusic');
    },
    
    loadNextLevel: function() {
        if (!this.currentLevel || !this.currentLevel.nextLevel) {
            // No next level, go back to menu
            this.showMainMenu();
            return;
        }
        
        const nextLevelId = this.currentLevel.nextLevel;
        const nextLevel = Levels[nextLevelId];
        
        if (!nextLevel) {
            console.error(`Next level ${nextLevelId} not found`);
            this.showMainMenu();
            return;
        }
        
        // Check if the level is unlocked or if we have enough score to unlock it
        if (!nextLevel.isUnlocked) {
            if (this.totalScore >= nextLevel.unlockRequirement) {
                // Unlock the level since we have enough score
                nextLevel.isUnlocked = true;
                UI.showNotification(`Unlocked ${nextLevel.name}!`);
            } else {
                UI.showNotification(`Score ${nextLevel.unlockRequirement} points to unlock ${nextLevel.name}!`);
                return;
            }
        }
        
        // Load the next level
        this.loadLevel(nextLevelId);
    },
    
    restartLevel: function() {
        if (!this.currentLevel) {
            this.showMainMenu();
            return;
        }
        
        // Reload the current level
        const levelId = Object.keys(Levels).find(key => Levels[key] === this.currentLevel);
        if (levelId) {
            this.loadLevel(levelId);
        } else {
            this.showMainMenu();
        }
    },
    
    createPlayer: function() {
        // Create a new player at the level's start position
        this.player = new Player(
            this.currentLevel.playerStartX,
            this.currentLevel.playerStartY,
            Physics.world
        );
        
        // Set up impact handler
        this.player.onImpact = this.handlePlayerImpact.bind(this);
        
        // Initialize stunt manager
        StuntManager.init(this.player);
    },
    
    handlePlayerImpact: function(impactData) {
        // Add score from impact
        this.addScore(impactData.score);
        
        // Play impact sound
        this.playSound('impact');
        
        // Apply screen shake based on impact force
        this.applyScreenShake(impactData.force);
    },
    
    handleLevelComplete: function() {
        // Only process once
        if (this.levelCompleteTimer) return;
        
        console.log("Level complete triggered!");
        
        // Update total score
        this.totalScore += this.score;
        
        // Check for high score
        this.checkHighScore();
        
        // Keep the game active for 3 seconds before showing the level complete screen
        this.isActive = true; // Keep physics running
        
        // Set timer to show level complete screen after delay
        this.levelCompleteTimer = setTimeout(() => {
            console.log("Showing level complete screen after delay");
            
            // Show level complete screen
            UI.showLevelComplete({
                height: this.player.maxHeight,
                stunts: this.player.currentStunts,
                impact: this.player.impactForce,
                score: this.score,
                totalScore: this.totalScore
            });
            
            // Deactivate the game
            this.isActive = false;
            this.levelCompleteTimer = null;
        }, this.levelCompleteDelay);
    },
    
    addScore: function(points) {
        // Apply level multiplier
        const multiplier = this.currentLevel ? this.currentLevel.scoreMultiplier : 1;
        const adjustedPoints = Math.floor(points * multiplier);
        
        this.score += adjustedPoints;
        
        // Update score animation
        this.scoreAnimation.targetValue = this.score;
        this.scoreAnimation.active = true;
        this.scoreAnimation.lastUpdateTime = Date.now();
        
        // If this is the first score, initialize the current value
        if (this.scoreAnimation.value === 0) {
            this.scoreAnimation.value = 0;
        }
        
        // Show score popup
        this.showScorePopup(adjustedPoints);
    },
    
    showScorePopup: function(points) {
        // Create a score popup element
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${Utils.formatNumber(points)}`;
        
        // Add to DOM
        document.querySelector('.game-container').appendChild(popup);
        
        // Animate
        setTimeout(() => {
            popup.classList.add('show');
            
            // Remove after animation
            setTimeout(() => {
                popup.remove();
            }, 1000);
        }, 10);
    },
    
    applyScreenShake: function(intensity) {
        // Apply screen shake effect based on intensity
        const maxShake = 20;
        const shakeDuration = 500; // ms
        const shakeIntensity = Math.min(intensity / 10, 1) * maxShake;
        
        if (shakeIntensity < 1) return;
        
        const container = document.querySelector('.game-container');
        const startTime = Date.now();
        
        const shakeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / shakeDuration;
            
            if (progress >= 1) {
                clearInterval(shakeInterval);
                container.style.transform = 'translate(0, 0)';
                return;
            }
            
            const currentIntensity = shakeIntensity * (1 - progress);
            const xOffset = (Math.random() * 2 - 1) * currentIntensity;
            const yOffset = (Math.random() * 2 - 1) * currentIntensity;
            
            container.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        }, 16);
    },
    
    togglePause: function() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            // Pause game music
            // this.pauseSound('levelMusic');
            
            // Show pause menu
            UI.showPauseMenu();
        } else {
            // Resume game music
            // this.resumeSound('levelMusic');
            
            // Hide pause menu
            UI.hidePauseMenu();
        }
    },
    
    checkHighScore: function() {
        // Check if current score is a high score
        const gameMode = this.gameMode || 'story';
        const levelId = Object.keys(Levels).find(key => Levels[key] === this.currentLevel);
        
        if (!levelId) return;
        
        // Get high scores for this level and mode
        if (!this.highScores[gameMode]) {
            this.highScores[gameMode] = {};
        }
        
        if (!this.highScores[gameMode][levelId]) {
            this.highScores[gameMode][levelId] = [];
        }
        
        const levelHighScores = this.highScores[gameMode][levelId];
        
        // Check if current score is a high score
        if (levelHighScores.length < 5 || this.score > levelHighScores[levelHighScores.length - 1]) {
            // Add the new score
            levelHighScores.push(this.score);
            
            // Sort high scores in descending order
            levelHighScores.sort((a, b) => b - a);
            
            // Keep only the top 5
            if (levelHighScores.length > 5) {
                levelHighScores.length = 5;
            }
            
            // Save high scores
            this.saveHighScores();
            
            // Show notification
            UI.showNotification('New high score!');
        }
    },
    
    checkLevelUnlocks: function(totalScore) {
        // Check if any levels should be unlocked based on total score
        const newUnlocks = [];
        
        Object.values(Levels).forEach(level => {
            if (!level.isUnlocked && totalScore >= level.unlockRequirement) {
                level.isUnlocked = true;
                newUnlocks.push(level.name);
            }
        });
        
        return newUnlocks;
    },
    
    loadHighScores: function() {
        // Load high scores from local storage
        const highScores = localStorage.getItem('groinSmashers_highScores');
        return highScores ? JSON.parse(highScores) : {};
    },
    
    saveHighScores: function() {
        // Save high scores to local storage
        localStorage.setItem('groinSmashers_highScores', JSON.stringify(this.highScores));
    },
    
    loadSounds: function() {
        // This would load actual sound files in a complete implementation
        // For now, just define the sound names
        this.sounds = {
            levelMusic: null,
            jump: null,
            impact: null,
            groinHitGround: null,
            groinHitSpike: null,
            groinHitTarget: null,
            groinHitObject: null,
            stuntPerformed: null,
            levelComplete: null,
            menuSelect: null
        };
    },
    
    playSound: function(soundName) {
        // This would play the actual sound in a complete implementation
        // For now, just log that the sound would play
        console.log(`Playing sound: ${soundName}`);
    },
    
    stopSound: function(soundName) {
        // This would stop the sound in a complete implementation
        console.log(`Stopping sound: ${soundName}`);
    },
    
    pauseSound: function(soundName) {
        // This would pause the sound in a complete implementation
        console.log(`Pausing sound: ${soundName}`);
    },
    
    resumeSound: function(soundName) {
        // This would resume the sound in a complete implementation
        console.log(`Resuming sound: ${soundName}`);
    }
};

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Game.init();
});
