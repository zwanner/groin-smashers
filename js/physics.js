/**
 * Physics handling for the Groin Smashers game
 */

const Physics = {
    init: function(game) {
        this.game = game;
        
        // Create a Matter.js engine with reduced initial gravity and improved stability
        this.engine = Matter.Engine.create({
            gravity: {
                x: 0,
                y: 1,
                scale: 0.0003  // Start with lower gravity
            },
            positionIterations: 8,  // Increase position iterations for stability (default is 6)
            velocityIterations: 8,  // Increase velocity iterations for stability (default is 4)
            constraintIterations: 4, // Increase constraint iterations for stability (default is 2)
            enableSleeping: true     // Enable sleeping for better performance
        });
        
        // Create a world
        this.world = this.engine.world;
        
        // Set up collision categories
        this.collisionCategories = {
            player: 0x0001,
            obstacle: 0x0002,
            ground: 0x0004,
            climbable: 0x0008,
            target: 0x0010
        };
        
        // Set up collision event handling
        Matter.Events.on(this.engine, 'collisionStart', this.handleCollisions.bind(this));
        
        // Track fall time for acceleration
        this.fallStartTime = 0;
        this.isFalling = false;
        
        // Start the engine
        Matter.Runner.run(this.engine);
    },
    
    update: function() {
        // Apply wind force if applicable
        if (this.game.currentLevel && this.game.currentLevel.windForce) {
            const windForce = this.game.currentLevel.windForce;
            
            // Apply wind to all bodies
            const bodies = Matter.Composite.allBodies(this.world);
            
            bodies.forEach(body => {
                if (!body.isStatic) {
                    Matter.Body.applyForce(
                        body,
                        body.position,
                        { x: windForce, y: 0 }
                    );
                }
            });
        }
        
        // Check for player near climbable objects
        if (this.game.player) {
            this.checkClimbables();
            
            // Implement accelerating gravity based on fall distance
            if (this.game.player.falling) {
                if (!this.isFalling) {
                    // Player just started falling
                    this.fallStartTime = Date.now();
                    this.isFalling = true;
                    this.fallStartY = this.game.player.y;
                }
                
                // Calculate fall duration in seconds
                const fallDuration = (Date.now() - this.fallStartTime) / 1000;
                
                // Calculate fall distance
                const fallDistance = Math.max(0, this.game.player.y - this.fallStartY);
                
                // Gradually increase gravity based on fall distance
                // Start with low gravity and increase up to a maximum
                const minGravity = 0.0003;
                const maxGravity = 0.002;
                
                // Calculate gravity scale based on fall distance
                // The longer/further the player falls, the faster they'll go
                let gravityScale = minGravity + 
                    (fallDistance / 10000) * (maxGravity - minGravity);
                
                // Cap at maximum gravity
                gravityScale = Math.min(gravityScale, maxGravity);
                
                // Apply the new gravity scale
                this.engine.world.gravity.scale = gravityScale;
                
                // Apply additional downward force for more dramatic acceleration
                if (this.game.player.parts && this.game.player.parts.torso) {
                    const accelerationForce = 0.00001 * fallDuration;
                    Matter.Body.applyForce(
                        this.game.player.parts.torso,
                        this.game.player.parts.torso.position,
                        { x: 0, y: accelerationForce }
                    );
                }
            } else if (this.isFalling) {
                // Player stopped falling, reset gravity
                this.isFalling = false;
                this.engine.world.gravity.scale = 0.0003;
            }
        }
    },
    
    handleCollisions: function(event) {
        const pairs = event.pairs;
        
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;
            
            // Check for player groin collision with ground or obstacles
            if (this.game.player && (bodyA.label === 'playerGroin' || bodyB.label === 'playerGroin')) {
                const otherBody = bodyA.label === 'playerGroin' ? bodyB : bodyA;
                const groinBody = bodyA.label === 'playerGroin' ? bodyA : bodyB;
                
                // Only count it as a groin hit if we're falling and hit something solid
                if (this.game.player.falling && 
                    otherBody.label !== 'playerLimb' && 
                    otherBody.label !== 'playerTorso') {
                    
                    this.game.player.hitGroin = true;
                    this.game.player.handleGroinImpact(pair);
                }
                
                // Play different sounds based on what was hit
                if (otherBody.label === 'ground') {
                    this.game.playSound('groinHitGround');
                } else if (otherBody.label === 'spike') {
                    this.game.playSound('groinHitSpike');
                } else if (otherBody.label === 'target') {
                    this.game.playSound('groinHitTarget');
                    
                    // Award bonus points for hitting targets
                    if (otherBody.renderData && otherBody.renderData.points) {
                        this.game.addScore(otherBody.renderData.points);
                    }
                } else {
                    this.game.playSound('groinHitObject');
                }
            }
            
            // Check for player collision with climbable objects
            if (this.game.player && 
                ((bodyA.label === 'playerTorso' && bodyB.label === 'climbable') ||
                (bodyB.label === 'playerTorso' && bodyA.label === 'climbable'))) {
                // Player is touching a climbable object
                this.game.player.canClimb = true;
            }
        }
    },
    
    checkClimbables: function() {
        // Make sure player exists
        if (!this.game.player) return;
        
        // Reset climbing state
        this.game.player.canClimb = false;
        
        // Get all climbable objects
        const bodies = Matter.Composite.allBodies(this.world);
        const climbables = bodies.filter(body => body.label === 'climbable');
        
        // Check if player is near any climbable object
        if (this.game.player.parts && this.game.player.parts.torso) {
            const playerPos = this.game.player.parts.torso.position;
            
            for (let i = 0; i < climbables.length; i++) {
                const climbable = climbables[i];
                const bounds = climbable.bounds;
                
                // Check if player is near the climbable object
                if (playerPos.x >= bounds.min.x - 30 && 
                    playerPos.x <= bounds.max.x + 30 && 
                    playerPos.y >= bounds.min.y - 30 && 
                    playerPos.y <= bounds.max.y + 30) {
                    
                    this.game.player.canClimb = true;
                    break;
                }
            }
        }
    },
    
    applyGravity: function(scale) {
        // Adjust gravity scale
        this.engine.world.gravity.scale = 0.001 * scale;
    },
    
    reset: function() {
        // Clear all bodies from the world
        Matter.Composite.clear(this.world, false);
    },
    
    createExplosion: function(x, y, radius, strength) {
        // Get all bodies within the explosion radius
        const bodies = Matter.Composite.allBodies(this.world);
        
        bodies.forEach(body => {
            if (!body.isStatic) {
                const distance = Matter.Vector.magnitude(
                    Matter.Vector.sub(
                        { x, y },
                        body.position
                    )
                );
                
                if (distance < radius) {
                    // Calculate force based on distance from explosion center
                    const force = strength * (1 - distance / radius);
                    
                    // Calculate direction away from explosion center
                    const direction = Matter.Vector.normalise(
                        Matter.Vector.sub(
                            body.position,
                            { x, y }
                        )
                    );
                    
                    // Apply force
                    Matter.Body.applyForce(
                        body,
                        body.position,
                        {
                            x: direction.x * force,
                            y: direction.y * force
                        }
                    );
                }
            }
        });
    },
    
    createRagdollEffect: function(body) {
        // Reduce joint stiffness to create a ragdoll effect
        if (body && body.constraints) {
            body.constraints.forEach(constraint => {
                constraint.stiffness = 0.1;
            });
        }
    },
    
    restoreJoints: function(body) {
        // Restore joint stiffness
        if (body && body.constraints) {
            body.constraints.forEach(constraint => {
                constraint.stiffness = 0.6;
            });
        }
    }
};
