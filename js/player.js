/**
 * Player class for the Groin Smashers game
 */

class Player {
    constructor(x, y, world) {
        this.startX = x;
        this.startY = y;
        this.world = world;
        this.width = 30;
        this.height = 60;
        this.color = '#FF9800';
        this.groinColor = '#FF5252';
        this.jumping = false;
        this.climbing = false;
        this.falling = false;
        this.stunting = false;
        this.grounded = false;
        this.facingRight = true;
        this.maxJumpHeight = 100;
        this.jumpForce = 0.2;
        this.climbSpeed = 2;
        this.maxStamina = 100;
        this.stamina = this.maxStamina;
        this.staminaRegenRate = 0.5;
        this.stuntList = [];
        this.currentStunts = [];
        this.impactForce = 0;
        this.maxHeight = 0;
        this.currentHeight = 0;
        this.score = 0;
        this.stuntMultiplier = 1;
        this.hitGroin = false;
        this.canClimb = false;
        this.isClimbing = false;
        this.walkSpeed = 0.01;
        this.airControlMultiplier = 0.6; // Reduced control in air
        this.movingLeft = false;
        this.movingRight = false;
        
        // Create the physics body
        this.createBody();
    }
    
    createBody() {
        // Create a composite body for the player
        const headOptions = { 
            friction: 0.5,
            restitution: 0.3,
            density: 0.002,
            label: 'playerHead'
        };
        
        const torsoOptions = { 
            friction: 0.5,
            restitution: 0.1,
            density: 0.002,
            label: 'playerTorso'
        };
        
        const limbOptions = { 
            friction: 0.2,
            restitution: 0.1,
            density: 0.001,
            label: 'playerLimb'
        };
        
        const groinOptions = { 
            friction: 0.2,
            restitution: 0.8,  // Higher restitution for the groin for comedic bouncing
            density: 0.003,    // Slightly higher density for the groin
            label: 'playerGroin'
        };
        
        // Create body parts
        const head = Matter.Bodies.circle(
            this.startX, 
            this.startY - 30, 
            10, 
            headOptions
        );
        
        const torso = Matter.Bodies.rectangle(
            this.startX, 
            this.startY, 
            this.width, 
            this.height - 20, 
            torsoOptions
        );
        
        const leftArm = Matter.Bodies.rectangle(
            this.startX - 20, 
            this.startY - 10, 
            20, 
            8, 
            limbOptions
        );
        
        const rightArm = Matter.Bodies.rectangle(
            this.startX + 20, 
            this.startY - 10, 
            20, 
            8, 
            limbOptions
        );
        
        const leftLeg = Matter.Bodies.rectangle(
            this.startX - 8, 
            this.startY + 25, 
            8, 
            30, 
            limbOptions
        );
        
        const rightLeg = Matter.Bodies.rectangle(
            this.startX + 8, 
            this.startY + 25, 
            8, 
            30, 
            limbOptions
        );
        
        const groin = Matter.Bodies.circle(
            this.startX, 
            this.startY + 15, 
            8, 
            groinOptions
        );
        
        // Create constraints (joints)
        const neckJoint = Matter.Constraint.create({
            bodyA: head,
            bodyB: torso,
            pointA: { x: 0, y: 10 },
            pointB: { x: 0, y: -25 },
            stiffness: 0.8,
            length: 0
        });
        
        const leftShoulderJoint = Matter.Constraint.create({
            bodyA: torso,
            bodyB: leftArm,
            pointA: { x: -15, y: -20 },
            pointB: { x: 10, y: 0 },
            stiffness: 0.6,
            length: 0
        });
        
        const rightShoulderJoint = Matter.Constraint.create({
            bodyA: torso,
            bodyB: rightArm,
            pointA: { x: 15, y: -20 },
            pointB: { x: -10, y: 0 },
            stiffness: 0.6,
            length: 0
        });
        
        const leftHipJoint = Matter.Constraint.create({
            bodyA: torso,
            bodyB: leftLeg,
            pointA: { x: -10, y: 25 },
            pointB: { x: 0, y: -15 },
            stiffness: 0.7,
            length: 0
        });
        
        const rightHipJoint = Matter.Constraint.create({
            bodyA: torso,
            bodyB: rightLeg,
            pointA: { x: 10, y: 25 },
            pointB: { x: 0, y: -15 },
            stiffness: 0.7,
            length: 0
        });
        
        const groinJoint = Matter.Constraint.create({
            bodyA: torso,
            bodyB: groin,
            pointA: { x: 0, y: 15 },
            pointB: { x: 0, y: -5 },
            stiffness: 0.8,
            length: 0
        });
        
        // Create a composite body
        this.body = Matter.Composite.create({
            bodies: [head, torso, leftArm, rightArm, leftLeg, rightLeg, groin],
            constraints: [neckJoint, leftShoulderJoint, rightShoulderJoint, leftHipJoint, rightHipJoint, groinJoint]
        });
        
        // Store references to individual parts
        this.parts = {
            head,
            torso,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg,
            groin
        };
        
        // Add the composite to the world
        Matter.Composite.add(this.world, this.body);
        
        // We'll handle collision detection in the Physics module instead
        // to avoid issues with accessing the engine directly
    }
    
    handleGroinImpact(collisionPair) {
        // Calculate impact force based on relative velocity
        const relativeVelocity = Matter.Vector.magnitude(Matter.Vector.sub(
            collisionPair.bodyA.velocity, 
            collisionPair.bodyB.velocity
        ));
        
        this.impactForce = Utils.calculateImpact(relativeVelocity, this.maxHeight);
        
        // Calculate score based on impact, stunts, and height
        const newScore = Utils.calculateScore(
            this.impactForce, 
            this.stuntMultiplier, 
            this.maxHeight
        );
        
        this.score += newScore;
        
        // Trigger impact event for game to handle
        if (typeof this.onImpact === 'function') {
            this.onImpact({
                force: this.impactForce,
                score: newScore,
                totalScore: this.score,
                stunts: this.currentStunts,
                height: this.maxHeight
            });
        }
    }
    
    update() {
        if (!this.body) return;
        
        // Get the position of the torso as the player's position
        const position = this.parts.torso.position;
        this.x = position.x;
        this.y = position.y;
        
        // Update current height from ground
        if (Game.currentLevel) {
            const groundY = Game.currentLevel.groundY;
            this.currentHeight = (groundY - this.y) / 50; // Convert to meters
            this.currentHeight = Math.max(0, this.currentHeight);
            
            // For vertical levels, we need to track the maximum height differently
            // since the player starts at the top and falls down
            if (Game.currentLevel.height > 1000) { // If it's a tall level
                // Calculate height as distance from starting position
                const startY = Game.currentLevel.playerStartY;
                const fallDistance = Math.max(0, this.y - startY);
                this.currentHeight = fallDistance / 50; // Convert to meters
            }
            
            // Debug output
            if (this.hitGroin) {
                console.log("Player hit groin, height:", this.currentHeight, "max height:", this.maxHeight);
            }
        }
        
        // Track maximum height
        if (this.currentHeight > this.maxHeight) {
            this.maxHeight = this.currentHeight;
        }
        
        // Check if player is falling
        const velocity = this.parts.torso.velocity;
        this.falling = velocity.y > 1;
        
        // Check if player is on the ground
        this.grounded = this.currentHeight < 0.5;
        
        // Regenerate stamina when on the ground
        if (this.grounded && this.stamina < this.maxStamina) {
            this.stamina += this.staminaRegenRate;
            if (this.stamina > this.maxStamina) {
                this.stamina = this.maxStamina;
            }
        }
        
        // Reset after landing
        if (this.grounded && this.falling) {
            this.falling = false;
            this.stunting = false;
            this.currentStunts = [];
            this.stuntMultiplier = 1;
            this.maxHeight = 0;
        }
        
        // Process player input
        this.handleInput();
    }
    
    jump() {
        if (this.grounded && this.stamina > 20) {
            // Apply upward force to the torso
            Matter.Body.applyForce(
                this.parts.torso, 
                this.parts.torso.position, 
                { x: 0, y: -this.jumpForce }
            );
            
            this.jumping = true;
            this.stamina -= 20;
        }
    }
    
    moveLeft() {
        if (this.stamina > 0) {
            // Apply different force based on whether player is in air or on ground
            const forceMultiplier = this.falling ? this.airControlMultiplier : 1;
            
            // Check if player is stuck (very low horizontal velocity)
            const isStuck = Math.abs(this.parts.torso.velocity.x) < 0.1;
            const stuckMultiplier = isStuck ? 3 : 1; // Apply 3x force when stuck
            
            const force = -this.walkSpeed * forceMultiplier * stuckMultiplier;
            
            // Apply horizontal force
            Matter.Body.applyForce(
                this.parts.torso, 
                this.parts.torso.position, 
                { x: force, y: 0 }
            );
            
            // If stuck, also apply a small upward force to help "unstick"
            if (isStuck && !this.falling) {
                Matter.Body.applyForce(
                    this.parts.torso,
                    this.parts.torso.position,
                    { x: 0, y: -0.005 }
                );
            }
            
            this.facingRight = false;
            this.movingLeft = true;
            this.stamina -= 0.2; // Reduced stamina cost
        }
    }
    
    moveRight() {
        if (this.stamina > 0) {
            // Apply different force based on whether player is in air or on ground
            const forceMultiplier = this.falling ? this.airControlMultiplier : 1;
            
            // Check if player is stuck (very low horizontal velocity)
            const isStuck = Math.abs(this.parts.torso.velocity.x) < 0.1;
            const stuckMultiplier = isStuck ? 3 : 1; // Apply 3x force when stuck
            
            const force = this.walkSpeed * forceMultiplier * stuckMultiplier;
            
            // Apply horizontal force
            Matter.Body.applyForce(
                this.parts.torso, 
                this.parts.torso.position, 
                { x: force, y: 0 }
            );
            
            // If stuck, also apply a small upward force to help "unstick"
            if (isStuck && !this.falling) {
                Matter.Body.applyForce(
                    this.parts.torso,
                    this.parts.torso.position,
                    { x: 0, y: -0.005 }
                );
            }
            
            this.facingRight = true;
            this.movingRight = true;
            this.stamina -= 0.2; // Reduced stamina cost
        }
    }
    
    handleInput() {
        // Process keyboard input for movement
        if (this.movingLeft) {
            this.moveLeft();
        }
        
        if (this.movingRight) {
            this.moveRight();
        }
        
        // Reset movement flags
        this.movingLeft = false;
        this.movingRight = false;
    }
    
    climb() {
        if (this.canClimb && this.stamina > 0) {
            Matter.Body.setPosition(
                this.parts.torso, 
                { 
                    x: this.parts.torso.position.x, 
                    y: this.parts.torso.position.y - this.climbSpeed 
                }
            );
            this.climbing = true;
            this.stamina -= 1;
        }
    }
    
    performStunt(stuntName) {
        if (!this.falling || this.grounded) return;
        
        // Find the stunt in the available stunts
        const stunt = this.stuntList.find(s => s.name === stuntName);
        if (!stunt) return;
        
        // Check if we've already performed this stunt in this fall
        if (this.currentStunts.some(s => s.name === stuntName)) return;
        
        // Apply the stunt effect
        if (stunt.effect) {
            stunt.effect(this);
        }
        
        // Add to current stunts and update multiplier
        this.currentStunts.push(stunt);
        this.stuntMultiplier += stunt.multiplier;
        this.stunting = true;
    }
    
    reset() {
        // Remove the old body from the world
        Matter.Composite.remove(this.world, this.body);
        
        // Reset properties
        this.jumping = false;
        this.climbing = false;
        this.falling = false;
        this.stunting = false;
        this.grounded = false;
        this.hitGroin = false;
        this.stamina = this.maxStamina;
        this.currentStunts = [];
        this.impactForce = 0;
        this.maxHeight = 0;
        this.currentHeight = 0;
        this.stuntMultiplier = 1;
        
        // Create a new body
        this.createBody();
    }
    
    draw(ctx) {
        if (!this.body) return;
        
        // Draw each body part
        ctx.save();
        
        // Draw limbs
        ctx.fillStyle = this.color;
        this.drawBodyPart(ctx, this.parts.leftArm);
        this.drawBodyPart(ctx, this.parts.rightArm);
        this.drawBodyPart(ctx, this.parts.leftLeg);
        this.drawBodyPart(ctx, this.parts.rightLeg);
        
        // Draw torso
        this.drawBodyPart(ctx, this.parts.torso);
        
        // Draw head
        this.drawBodyPart(ctx, this.parts.head);
        
        // Draw groin with special color
        ctx.fillStyle = this.groinColor;
        this.drawBodyPart(ctx, this.parts.groin);
        
        // Draw face (simple eyes and mouth)
        const headPos = this.parts.head.position;
        const headRadius = 10;
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(headPos.x - 3, headPos.y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(headPos.x + 3, headPos.y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(headPos.x - 3 + (this.facingRight ? 0.5 : -0.5), headPos.y - 2, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(headPos.x + 3 + (this.facingRight ? 0.5 : -0.5), headPos.y - 2, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth (changes based on state)
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        if (this.hitGroin) {
            // Pained expression
            ctx.arc(headPos.x, headPos.y + 3, 3, 0, Math.PI, false);
        } else if (this.falling) {
            // Worried expression
            ctx.arc(headPos.x, headPos.y + 3, 3, Math.PI, 0, false);
        } else {
            // Normal expression
            ctx.moveTo(headPos.x - 3, headPos.y + 3);
            ctx.lineTo(headPos.x + 3, headPos.y + 3);
        }
        
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawBodyPart(ctx, part) {
        const pos = part.position;
        
        ctx.beginPath();
        
        if (part.label === 'playerHead' || part.label === 'playerGroin') {
            // Draw circles for head and groin
            const radius = part.circleRadius;
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        } else {
            // Draw rectangles for other body parts
            const vertices = part.vertices;
            ctx.moveTo(vertices[0].x, vertices[0].y);
            
            for (let i = 1; i < vertices.length; i++) {
                ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            
            ctx.lineTo(vertices[0].x, vertices[0].y);
        }
        
        ctx.fill();
    }
}
