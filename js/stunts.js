/**
 * Stunt definitions for the Groin Smashers game
 */

class Stunt {
    constructor(config) {
        this.name = config.name;
        this.description = config.description;
        this.multiplier = config.multiplier || 0.2;
        this.difficulty = config.difficulty || 1;
        this.unlockRequirement = config.unlockRequirement || 0;
        this.isUnlocked = config.isUnlocked || false;
        this.effect = config.effect || null;
        this.keyCombo = config.keyCombo || [];
        this.animation = config.animation || null;
    }
}

const StuntManager = {
    init: function(player) {
        this.player = player;
        this.setupStunts();
        this.bindKeys();
    },
    
    setupStunts: function() {
        // Define all available stunts
        const stunts = [
            // Basic stunts (available from start)
            new Stunt({
                name: 'Backflip',
                description: 'Perform a backward flip in the air',
                multiplier: 0.3,
                difficulty: 1,
                isUnlocked: true,
                keyCombo: ['ArrowUp', 'ArrowDown'],
                effect: (player) => {
                    // Apply rotational force to simulate a backflip
                    Matter.Body.setAngularVelocity(player.parts.torso, -0.2);
                    
                    // Apply slight upward force for a better-looking flip
                    Matter.Body.applyForce(
                        player.parts.torso,
                        player.parts.torso.position,
                        { x: 0, y: -0.01 }
                    );
                }
            }),
            
            new Stunt({
                name: 'Frontflip',
                description: 'Perform a forward flip in the air',
                multiplier: 0.3,
                difficulty: 1,
                isUnlocked: true,
                keyCombo: ['ArrowDown', 'ArrowUp'],
                effect: (player) => {
                    // Apply rotational force to simulate a frontflip
                    Matter.Body.setAngularVelocity(player.parts.torso, 0.2);
                    
                    // Apply slight upward force for a better-looking flip
                    Matter.Body.applyForce(
                        player.parts.torso,
                        player.parts.torso.position,
                        { x: 0, y: -0.01 }
                    );
                }
            }),
            
            new Stunt({
                name: 'Spin',
                description: 'Perform a 360-degree spin in the air',
                multiplier: 0.2,
                difficulty: 1,
                isUnlocked: true,
                keyCombo: ['ArrowLeft', 'ArrowRight'],
                effect: (player) => {
                    // Apply rotational force to simulate a spin
                    Matter.Body.setAngularVelocity(player.parts.torso, 0.15);
                }
            }),
            
            // Intermediate stunts (unlocked with score)
            new Stunt({
                name: 'Double Backflip',
                description: 'Perform two backward flips in succession',
                multiplier: 0.6,
                difficulty: 2,
                unlockRequirement: 5000,
                keyCombo: ['ArrowUp', 'ArrowDown', 'ArrowUp', 'ArrowDown'],
                effect: (player) => {
                    // Apply stronger rotational force for a double flip
                    Matter.Body.setAngularVelocity(player.parts.torso, -0.3);
                    
                    // Apply upward force for a higher flip
                    Matter.Body.applyForce(
                        player.parts.torso,
                        player.parts.torso.position,
                        { x: 0, y: -0.02 }
                    );
                }
            }),
            
            new Stunt({
                name: 'Double Frontflip',
                description: 'Perform two forward flips in succession',
                multiplier: 0.6,
                difficulty: 2,
                unlockRequirement: 5000,
                keyCombo: ['ArrowDown', 'ArrowUp', 'ArrowDown', 'ArrowUp'],
                effect: (player) => {
                    // Apply stronger rotational force for a double flip
                    Matter.Body.setAngularVelocity(player.parts.torso, 0.3);
                    
                    // Apply upward force for a higher flip
                    Matter.Body.applyForce(
                        player.parts.torso,
                        player.parts.torso.position,
                        { x: 0, y: -0.02 }
                    );
                }
            }),
            
            new Stunt({
                name: 'Corkscrew',
                description: 'Perform a diagonal spinning flip',
                multiplier: 0.5,
                difficulty: 2,
                unlockRequirement: 7500,
                keyCombo: ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'],
                effect: (player) => {
                    // Apply rotational forces in multiple axes
                    Matter.Body.setAngularVelocity(player.parts.torso, 0.2);
                    
                    // Apply forces to create a corkscrew motion
                    Matter.Body.applyForce(
                        player.parts.torso,
                        player.parts.torso.position,
                        { x: 0.01, y: -0.015 }
                    );
                    
                    // Apply forces to the limbs for a more dramatic effect
                    Matter.Body.applyForce(
                        player.parts.leftArm,
                        player.parts.leftArm.position,
                        { x: -0.001, y: -0.001 }
                    );
                    
                    Matter.Body.applyForce(
                        player.parts.rightArm,
                        player.parts.rightArm.position,
                        { x: 0.001, y: -0.001 }
                    );
                }
            }),
            
            // Advanced stunts (unlocked with higher scores)
            new Stunt({
                name: 'Triple Backflip',
                description: 'Perform three backward flips in succession',
                multiplier: 1.0,
                difficulty: 3,
                unlockRequirement: 15000,
                keyCombo: ['ArrowUp', 'ArrowDown', 'ArrowUp', 'ArrowDown', 'ArrowUp', 'ArrowDown'],
                effect: (player) => {
                    // Apply even stronger rotational force for a triple flip
                    Matter.Body.setAngularVelocity(player.parts.torso, -0.4);
                    
                    // Apply stronger upward force for a higher flip
                    Matter.Body.applyForce(
                        player.parts.torso,
                        player.parts.torso.position,
                        { x: 0, y: -0.03 }
                    );
                }
            }),
            
            new Stunt({
                name: 'Superman',
                description: 'Stretch out like Superman while flying through the air',
                multiplier: 0.8,
                difficulty: 3,
                unlockRequirement: 10000,
                keyCombo: ['ArrowRight', 'ArrowRight', 'ArrowUp'],
                effect: (player) => {
                    // Stretch out the body to simulate the Superman pose
                    // Apply forces to the limbs
                    Matter.Body.applyForce(
                        player.parts.leftArm,
                        player.parts.leftArm.position,
                        { x: -0.002, y: -0.001 }
                    );
                    
                    Matter.Body.applyForce(
                        player.parts.rightArm,
                        player.parts.rightArm.position,
                        { x: 0.002, y: -0.001 }
                    );
                    
                    Matter.Body.applyForce(
                        player.parts.leftLeg,
                        player.parts.leftLeg.position,
                        { x: -0.001, y: 0.001 }
                    );
                    
                    Matter.Body.applyForce(
                        player.parts.rightLeg,
                        player.parts.rightLeg.position,
                        { x: 0.001, y: 0.001 }
                    );
                    
                    // Apply slight forward momentum
                    Matter.Body.applyForce(
                        player.parts.torso,
                        player.parts.torso.position,
                        { x: 0.01, y: 0 }
                    );
                }
            }),
            
            new Stunt({
                name: 'Cannonball',
                description: 'Curl up into a ball for maximum impact',
                multiplier: 0.7,
                difficulty: 2,
                unlockRequirement: 8000,
                keyCombo: ['ArrowDown', 'ArrowDown'],
                effect: (player) => {
                    // Curl up the body to simulate a cannonball
                    // Apply forces to the limbs to bring them closer to the torso
                    Matter.Body.applyForce(
                        player.parts.leftArm,
                        player.parts.leftArm.position,
                        { x: 0.002, y: 0.002 }
                    );
                    
                    Matter.Body.applyForce(
                        player.parts.rightArm,
                        player.parts.rightArm.position,
                        { x: -0.002, y: 0.002 }
                    );
                    
                    Matter.Body.applyForce(
                        player.parts.leftLeg,
                        player.parts.leftLeg.position,
                        { x: 0.002, y: -0.002 }
                    );
                    
                    Matter.Body.applyForce(
                        player.parts.rightLeg,
                        player.parts.rightLeg.position,
                        { x: -0.002, y: -0.002 }
                    );
                    
                    // Apply slight downward momentum for faster falling
                    Matter.Body.applyForce(
                        player.parts.torso,
                        player.parts.torso.position,
                        { x: 0, y: 0.01 }
                    );
                }
            }),
            
            // Expert stunts (unlocked with very high scores)
            new Stunt({
                name: 'Helicopter',
                description: 'Spin rapidly like a helicopter',
                multiplier: 1.2,
                difficulty: 4,
                unlockRequirement: 20000,
                keyCombo: ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
                effect: (player) => {
                    // Apply very strong rotational force
                    Matter.Body.setAngularVelocity(player.parts.torso, 0.5);
                    
                    // Apply forces to the limbs for a more dramatic effect
                    Matter.Body.applyForce(
                        player.parts.leftArm,
                        player.parts.leftArm.position,
                        { x: -0.003, y: 0 }
                    );
                    
                    Matter.Body.applyForce(
                        player.parts.rightArm,
                        player.parts.rightArm.position,
                        { x: 0.003, y: 0 }
                    );
                }
            }),
            
            new Stunt({
                name: 'Spread Eagle',
                description: 'Spread out all limbs for maximum air resistance',
                multiplier: 0.9,
                difficulty: 3,
                unlockRequirement: 12000,
                keyCombo: ['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'],
                effect: (player) => {
                    // Spread out all limbs
                    Matter.Body.applyForce(
                        player.parts.leftArm,
                        player.parts.leftArm.position,
                        { x: -0.003, y: -0.001 }
                    );
                    
                    Matter.Body.applyForce(
                        player.parts.rightArm,
                        player.parts.rightArm.position,
                        { x: 0.003, y: -0.001 }
                    );
                    
                    Matter.Body.applyForce(
                        player.parts.leftLeg,
                        player.parts.leftLeg.position,
                        { x: -0.002, y: 0.002 }
                    );
                    
                    Matter.Body.applyForce(
                        player.parts.rightLeg,
                        player.parts.rightLeg.position,
                        { x: 0.002, y: 0.002 }
                    );
                    
                    // Apply slight upward force to simulate air resistance
                    Matter.Body.applyForce(
                        player.parts.torso,
                        player.parts.torso.position,
                        { x: 0, y: -0.005 }
                    );
                }
            }),
            
            new Stunt({
                name: 'Groin Torpedo',
                description: 'Position for maximum groin impact velocity',
                multiplier: 1.5,
                difficulty: 4,
                unlockRequirement: 25000,
                keyCombo: ['ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowDown'],
                effect: (player) => {
                    // Position the body for a groin-first landing
                    Matter.Body.setAngle(player.parts.torso, Math.PI);
                    
                    // Apply forces to position the groin downward
                    Matter.Body.applyForce(
                        player.parts.groin,
                        player.parts.groin.position,
                        { x: 0, y: 0.005 }
                    );
                    
                    // Apply forces to the limbs for a streamlined position
                    Matter.Body.applyForce(
                        player.parts.leftArm,
                        player.parts.leftArm.position,
                        { x: -0.001, y: -0.002 }
                    );
                    
                    Matter.Body.applyForce(
                        player.parts.rightArm,
                        player.parts.rightArm.position,
                        { x: 0.001, y: -0.002 }
                    );
                    
                    Matter.Body.applyForce(
                        player.parts.leftLeg,
                        player.parts.leftLeg.position,
                        { x: -0.001, y: -0.001 }
                    );
                    
                    Matter.Body.applyForce(
                        player.parts.rightLeg,
                        player.parts.rightLeg.position,
                        { x: 0.001, y: -0.001 }
                    );
                    
                    // Apply downward momentum for faster falling
                    Matter.Body.applyForce(
                        player.parts.torso,
                        player.parts.torso.position,
                        { x: 0, y: 0.02 }
                    );
                }
            })
        ];
        
        // Add stunts to player
        this.player.stuntList = stunts;
    },
    
    bindKeys: function() {
        // Set up key tracking for stunt combos
        this.keyBuffer = [];
        this.lastKeyTime = 0;
        this.comboTimeWindow = 1000; // Time window in ms for key combos
        
        window.addEventListener('keydown', (e) => {
            // Only track arrow keys for stunts
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                const currentTime = Date.now();
                
                // Clear buffer if too much time has passed since last key
                if (currentTime - this.lastKeyTime > this.comboTimeWindow) {
                    this.keyBuffer = [];
                }
                
                // Add key to buffer
                this.keyBuffer.push(e.key);
                this.lastKeyTime = currentTime;
                
                // Limit buffer size
                if (this.keyBuffer.length > 6) {
                    this.keyBuffer.shift();
                }
                
                // Check for stunt combos
                this.checkStuntCombos();
            }
        });
    },
    
    checkStuntCombos: function() {
        // Don't check for stunts if player isn't falling
        if (!this.player.falling || this.player.grounded) return;
        
        // Check each stunt to see if its combo matches the key buffer
        for (const stunt of this.player.stuntList) {
            // Skip locked stunts
            if (!stunt.isUnlocked) continue;
            
            // Check if the end of the key buffer matches this stunt's combo
            if (this.keyBuffer.length >= stunt.keyCombo.length) {
                const startIndex = this.keyBuffer.length - stunt.keyCombo.length;
                const bufferSlice = this.keyBuffer.slice(startIndex);
                
                let matches = true;
                for (let i = 0; i < stunt.keyCombo.length; i++) {
                    if (bufferSlice[i] !== stunt.keyCombo[i]) {
                        matches = false;
                        break;
                    }
                }
                
                if (matches) {
                    // Perform the stunt
                    this.player.performStunt(stunt.name);
                    
                    // Clear the key buffer after a successful stunt
                    this.keyBuffer = [];
                    break;
                }
            }
        }
    },
    
    unlockStunts: function(score) {
        // Check each stunt to see if it should be unlocked based on score
        let newUnlocks = [];
        
        this.player.stuntList.forEach(stunt => {
            if (!stunt.isUnlocked && score >= stunt.unlockRequirement) {
                stunt.isUnlocked = true;
                newUnlocks.push(stunt);
            }
        });
        
        return newUnlocks;
    },
    
    getStuntInfo: function(stuntName) {
        return this.player.stuntList.find(stunt => stunt.name === stuntName);
    },
    
    getUnlockedStunts: function() {
        return this.player.stuntList.filter(stunt => stunt.isUnlocked);
    },
    
    getLockedStunts: function() {
        return this.player.stuntList.filter(stunt => !stunt.isUnlocked);
    }
};
