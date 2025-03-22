/**
 * Level definitions for the Groin Smashers game
 */

class Level {
    constructor(config) {
        this.name = config.name || 'Unnamed Level';
        this.background = config.background || '#1e1e1e';
        this.width = config.width || 1000;
        this.height = config.height || 600;
        this.groundY = config.groundY || this.height - 50;
        this.playerStartX = config.playerStartX || this.width / 2;
        this.playerStartY = config.playerStartY || this.height / 2;
        this.obstacles = config.obstacles || [];
        this.climbables = config.climbables || [];
        this.targets = config.targets || [];
        this.decorations = config.decorations || [];
        this.scoreMultiplier = config.scoreMultiplier || 1;
        this.windForce = config.windForce || 0;
        this.gravity = config.gravity || 1;
        this.unlockRequirement = config.unlockRequirement || 0;
        this.nextLevel = config.nextLevel || null;
        this.isUnlocked = config.isUnlocked || false;
        this.description = config.description || '';
    }
    
    createPhysics(world) {
        this.bodies = [];
        
        // Create ground
        const ground = Matter.Bodies.rectangle(
            this.width / 2,
            this.groundY + 25,
            this.width,
            50,
            { 
                isStatic: true,
                label: 'ground',
                friction: 0.5,
                restitution: 0.2
            }
        );
        
        this.bodies.push(ground);
        
        // Create walls
        const leftWall = Matter.Bodies.rectangle(
            -25,
            this.height / 2,
            50,
            this.height,
            { isStatic: true, label: 'wall' }
        );
        
        const rightWall = Matter.Bodies.rectangle(
            this.width + 25,
            this.height / 2,
            50,
            this.height,
            { isStatic: true, label: 'wall' }
        );
        
        this.bodies.push(leftWall, rightWall);
        
        // Create obstacles
        this.obstacles.forEach(obstacle => {
            let body;
            
            switch (obstacle.type) {
                case 'rectangle':
                    body = Matter.Bodies.rectangle(
                        obstacle.x,
                        obstacle.y,
                        obstacle.width,
                        obstacle.height,
                        { 
                            isStatic: obstacle.isStatic !== false,
                            label: obstacle.label || 'obstacle',
                            friction: obstacle.friction || 0.5,
                            restitution: obstacle.restitution || 0.2,
                            angle: obstacle.angle || 0,
                            render: {
                                fillStyle: obstacle.color || '#F5F5F5'
                            }
                        }
                    );
                    break;
                    
                case 'circle':
                    body = Matter.Bodies.circle(
                        obstacle.x,
                        obstacle.y,
                        obstacle.radius,
                        { 
                            isStatic: obstacle.isStatic !== false,
                            label: obstacle.label || 'obstacle',
                            friction: obstacle.friction || 0.5,
                            restitution: obstacle.restitution || 0.2,
                            render: {
                                fillStyle: obstacle.color || '#F5F5F5'
                            }
                        }
                    );
                    break;
                    
                case 'polygon':
                    body = Matter.Bodies.polygon(
                        obstacle.x,
                        obstacle.y,
                        obstacle.sides,
                        obstacle.radius,
                        { 
                            isStatic: obstacle.isStatic !== false,
                            label: obstacle.label || 'obstacle',
                            friction: obstacle.friction || 0.5,
                            restitution: obstacle.restitution || 0.2,
                            angle: obstacle.angle || 0,
                            render: {
                                fillStyle: obstacle.color || '#F5F5F5'
                            }
                        }
                    );
                    break;
                    
                case 'spike':
                    // Create a triangle for the spike
                    const vertices = [
                        { x: obstacle.x - obstacle.width / 2, y: obstacle.y + obstacle.height / 2 },
                        { x: obstacle.x + obstacle.width / 2, y: obstacle.y + obstacle.height / 2 },
                        { x: obstacle.x, y: obstacle.y - obstacle.height / 2 }
                    ];
                    
                    body = Matter.Bodies.fromVertices(
                        obstacle.x,
                        obstacle.y,
                        [vertices],
                        { 
                            isStatic: obstacle.isStatic !== false,
                            label: 'spike',
                            friction: 0.5,
                            restitution: 0.1,
                            render: {
                                fillStyle: obstacle.color || '#FF5252'
                            }
                        }
                    );
                    break;
            }
            
            if (body) {
                // Store additional properties on the body for rendering
                body.originalColor = obstacle.color || '#F5F5F5';
                body.renderData = {
                    type: obstacle.type,
                    width: obstacle.width,
                    height: obstacle.height,
                    radius: obstacle.radius,
                    sides: obstacle.sides,
                    texture: obstacle.texture
                };
                
                this.bodies.push(body);
            }
        });
        
        // Create climbable objects
        this.climbables.forEach(climbable => {
            const body = Matter.Bodies.rectangle(
                climbable.x,
                climbable.y,
                climbable.width,
                climbable.height,
                { 
                    isStatic: true,
                    label: 'climbable',
                    friction: 0.8,
                    render: {
                        fillStyle: climbable.color || '#8BC34A'
                    }
                }
            );
            
            body.originalColor = climbable.color || '#8BC34A';
            body.renderData = {
                type: 'rectangle',
                width: climbable.width,
                height: climbable.height,
                texture: climbable.texture
            };
            
            this.bodies.push(body);
        });
        
        // Create target objects (for bonus points)
        this.targets.forEach(target => {
            const body = Matter.Bodies.rectangle(
                target.x,
                target.y,
                target.width,
                target.height,
                { 
                    isStatic: true,
                    label: 'target',
                    friction: 0.2,
                    restitution: 0.8,
                    render: {
                        fillStyle: target.color || '#FFEB3B'
                    }
                }
            );
            
            body.originalColor = target.color || '#FFEB3B';
            body.renderData = {
                type: 'rectangle',
                width: target.width,
                height: target.height,
                texture: target.texture,
                points: target.points || 1000
            };
            
            this.bodies.push(body);
        });
        
        // Add all bodies to the world
        Matter.Composite.add(world, this.bodies);
    }
    
    removePhysics(world) {
        if (this.bodies && this.bodies.length > 0) {
            Matter.Composite.remove(world, this.bodies);
        }
    }
    
    draw(ctx) {
        // Draw background
        ctx.fillStyle = this.background;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw decorations
        this.decorations.forEach(decoration => {
            if (decoration.type === 'rect') {
                ctx.fillStyle = decoration.color || '#555555';
                ctx.fillRect(
                    decoration.x,
                    decoration.y,
                    decoration.width,
                    decoration.height
                );
            } else if (decoration.type === 'circle') {
                ctx.fillStyle = decoration.color || '#555555';
                ctx.beginPath();
                ctx.arc(
                    decoration.x,
                    decoration.y,
                    decoration.radius,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            } else if (decoration.type === 'image' && decoration.image) {
                ctx.drawImage(
                    decoration.image,
                    decoration.x,
                    decoration.y,
                    decoration.width,
                    decoration.height
                );
            }
        });
        
        // Draw physics bodies
        if (this.bodies) {
            this.bodies.forEach(body => {
                if (body.render && body.render.visible !== false) {
                    ctx.fillStyle = body.render.fillStyle || '#F5F5F5';
                    
                    if (body.renderData && body.renderData.texture) {
                        // Draw textured objects (not implemented in this version)
                    } else {
                        // Draw based on shape
                        if (body.circleRadius) {
                            // Circle
                            ctx.beginPath();
                            ctx.arc(
                                body.position.x,
                                body.position.y,
                                body.circleRadius,
                                0,
                                Math.PI * 2
                            );
                            ctx.fill();
                        } else {
                            // Polygon
                            const vertices = body.vertices;
                            
                            ctx.beginPath();
                            ctx.moveTo(vertices[0].x, vertices[0].y);
                            
                            for (let i = 1; i < vertices.length; i++) {
                                ctx.lineTo(vertices[i].x, vertices[i].y);
                            }
                            
                            ctx.lineTo(vertices[0].x, vertices[0].y);
                            ctx.fill();
                            
                            // Draw spikes with a special pattern
                            if (body.label === 'spike') {
                                ctx.strokeStyle = '#000000';
                                ctx.lineWidth = 1;
                                ctx.stroke();
                            }
                        }
                    }
                }
            });
        }
        
        // Draw ground
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
    }
}

// Define all game levels
const Levels = {
    // Level 1: Supply Room
    supplyRoom: new Level({
        name: 'Supply Room',
        background: '#263238',
        width: 1000,
        height: 40000,  // 20x taller level
        groundY: 39950, // Ground is near the bottom
        playerStartX: 400,
        playerStartY: 100,  // Start at the top
        isUnlocked: true,
        description: 'A simple supply room with crates to climb and jump from.',
        scoreMultiplier: 1,
        obstacles: [
            // Starting platform
            {
                type: 'rectangle',
                x: 400,
                y: 150,
                width: 300,
                height: 30,
                color: '#8D6E63'
            },
            
            // Upper section - Crates and boxes (0-5000)
            {
                type: 'rectangle',
                x: 200,
                y: 500,
                width: 150,
                height: 50,
                color: '#8D6E63'
            },
            {
                type: 'rectangle',
                x: 600,
                y: 700,
                width: 150,
                height: 50,
                color: '#8D6E63'
            },
            {
                type: 'rectangle',
                x: 300,
                y: 900,
                width: 200,
                height: 50,
                color: '#8D6E63'
            },
            {
                type: 'rectangle',
                x: 500,
                y: 1100,
                width: 150,
                height: 50,
                color: '#8D6E63'
            },
            {
                type: 'rectangle',
                x: 250,
                y: 1300,
                width: 200,
                height: 50,
                color: '#8D6E63'
            },
            {
                type: 'rectangle',
                x: 450,
                y: 1500,
                width: 150,
                height: 50,
                color: '#8D6E63'
            },
            {
                type: 'rectangle',
                x: 350,
                y: 1800,
                width: 180,
                height: 40,
                color: '#8D6E63'
            },
            {
                type: 'rectangle',
                x: 200,
                y: 2200,
                width: 160,
                height: 45,
                color: '#8D6E63'
            },
            {
                type: 'rectangle',
                x: 600,
                y: 2500,
                width: 170,
                height: 45,
                color: '#8D6E63'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 2800,
                width: 190,
                height: 40,
                color: '#8D6E63'
            },
            {
                type: 'rectangle',
                x: 250,
                y: 3200,
                width: 150,
                height: 50,
                color: '#8D6E63'
            },
            {
                type: 'rectangle',
                x: 550,
                y: 3600,
                width: 160,
                height: 45,
                color: '#8D6E63'
            },
            {
                type: 'rectangle',
                x: 350,
                y: 4000,
                width: 180,
                height: 40,
                color: '#8D6E63'
            },
            {
                type: 'rectangle',
                x: 500,
                y: 4500,
                width: 170,
                height: 45,
                color: '#8D6E63'
            },
            
            // Middle section - Circles and polygons (5000-20000)
            {
                type: 'circle',
                x: 300,
                y: 5500,
                radius: 60,
                color: '#5D4037'
            },
            {
                type: 'circle',
                x: 500,
                y: 6500,
                radius: 70,
                color: '#5D4037'
            },
            {
                type: 'circle',
                x: 200,
                y: 7500,
                radius: 65,
                color: '#5D4037'
            },
            {
                type: 'circle',
                x: 600,
                y: 8500,
                radius: 75,
                color: '#5D4037'
            },
            {
                type: 'polygon',
                x: 400,
                y: 9500,
                sides: 6,
                radius: 80,
                color: '#795548'
            },
            {
                type: 'polygon',
                x: 250,
                y: 11000,
                sides: 5,
                radius: 70,
                color: '#795548'
            },
            {
                type: 'polygon',
                x: 550,
                y: 12500,
                sides: 8,
                radius: 85,
                color: '#795548'
            },
            {
                type: 'polygon',
                x: 350,
                y: 14000,
                sides: 3,
                radius: 75,
                color: '#795548',
                angle: Math.PI
            },
            {
                type: 'circle',
                x: 450,
                y: 15500,
                radius: 90,
                color: '#5D4037'
            },
            {
                type: 'polygon',
                x: 300,
                y: 17000,
                sides: 4,
                radius: 80,
                color: '#795548',
                angle: Math.PI / 4
            },
            {
                type: 'circle',
                x: 500,
                y: 18500,
                radius: 85,
                color: '#5D4037'
            },
            
            // Lower section - Spikes and targets (20000-39000)
            {
                type: 'spike',
                x: 250,
                y: 21000,
                width: 50,
                height: 80,
                color: '#FF5252'
            },
            {
                type: 'spike',
                x: 550,
                y: 21000,
                width: 50,
                height: 80,
                color: '#FF5252'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 22000,
                width: 300,
                height: 40,
                color: '#8D6E63'
            },
            {
                type: 'spike',
                x: 200,
                y: 24000,
                width: 60,
                height: 90,
                color: '#FF5252'
            },
            {
                type: 'spike',
                x: 600,
                y: 24000,
                width: 60,
                height: 90,
                color: '#FF5252'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 25000,
                width: 350,
                height: 40,
                color: '#8D6E63'
            },
            {
                type: 'spike',
                x: 300,
                y: 27000,
                width: 70,
                height: 100,
                color: '#FF5252'
            },
            {
                type: 'spike',
                x: 500,
                y: 27000,
                width: 70,
                height: 100,
                color: '#FF5252'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 28000,
                width: 300,
                height: 40,
                color: '#8D6E63'
            },
            {
                type: 'spike',
                x: 250,
                y: 30000,
                width: 80,
                height: 110,
                color: '#FF5252'
            },
            {
                type: 'spike',
                x: 400,
                y: 30000,
                width: 80,
                height: 110,
                color: '#FF5252'
            },
            {
                type: 'spike',
                x: 550,
                y: 30000,
                width: 80,
                height: 110,
                color: '#FF5252'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 31000,
                width: 450,
                height: 40,
                color: '#8D6E63'
            },
            {
                type: 'rectangle',
                x: 200,
                y: 33000,
                width: 150,
                height: 40,
                color: '#FFEB3B',
                label: 'target'
            },
            {
                type: 'rectangle',
                x: 600,
                y: 33000,
                width: 150,
                height: 40,
                color: '#FFEB3B',
                label: 'target'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 35000,
                width: 300,
                height: 40,
                color: '#8D6E63'
            },
            {
                type: 'rectangle',
                x: 300,
                y: 37000,
                width: 200,
                height: 40,
                color: '#FFEB3B',
                label: 'target'
            },
            {
                type: 'rectangle',
                x: 500,
                y: 37000,
                width: 200,
                height: 40,
                color: '#FFEB3B',
                label: 'target'
            },
            
            // Bottom section - Final targets
            {
                type: 'rectangle',
                x: 400,
                y: 39800,
                width: 300,
                height: 40,
                color: '#FFEB3B',
                label: 'target'
            }
        ],
        climbables: [
            {
                x: 100,
                y: 20000,
                width: 20,
                height: 40000,
                color: '#795548'
            },
            {
                x: 700,
                y: 20000,
                width: 20,
                height: 40000,
                color: '#795548'
            }
        ],
        decorations: [
            {
                type: 'rect',
                x: 0,
                y: 0,
                width: 300,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rect',
                x: 700,
                y: 100,
                width: 100,
                height: 150,
                color: '#607D8B'
            }
        ],
        nextLevel: 'mountain'
    }),
    
    // Level 2: Mountain
    mountain: new Level({
        name: 'Mountain Peak',
        background: '#B3E5FC',
        width: 1000,
        height: 40000,  // 20x taller level
        groundY: 39950, // Ground is near the bottom
        playerStartX: 400,
        playerStartY: 100,  // Start at the top
        unlockRequirement: 5,
        description: 'A treacherous mountain with jagged rocks and high cliffs.',
        scoreMultiplier: 1.5,
        gravity: 1.1,
        obstacles: [
            // Starting platform
            {
                type: 'rectangle',
                x: 400,
                y: 150,
                width: 300,
                height: 30,
                color: '#78909C'
            },
            
            // Upper section - Mountain peaks (0-10000)
            {
                type: 'polygon',
                x: 300,
                y: 400,
                sides: 3,
                radius: 50,
                color: '#78909C',
                angle: Math.PI
            },
            {
                type: 'rectangle',
                x: 500,
                y: 600,
                width: 200,
                height: 50,
                color: '#78909C'
            },
            {
                type: 'polygon',
                x: 250,
                y: 800,
                sides: 3,
                radius: 50,
                color: '#78909C',
                angle: Math.PI
            },
            {
                type: 'rectangle',
                x: 550,
                y: 1000,
                width: 150,
                height: 50,
                color: '#78909C'
            },
            {
                type: 'polygon',
                x: 350,
                y: 1200,
                sides: 3,
                radius: 60,
                color: '#78909C',
                angle: Math.PI
            },
            {
                type: 'rectangle',
                x: 450,
                y: 1400,
                width: 200,
                height: 50,
                color: '#78909C'
            },
            {
                type: 'polygon',
                x: 200,
                y: 1800,
                sides: 3,
                radius: 70,
                color: '#78909C',
                angle: Math.PI
            },
            {
                type: 'rectangle',
                x: 400,
                y: 2200,
                width: 200,
                height: 50,
                color: '#78909C'
            },
            {
                type: 'polygon',
                x: 600,
                y: 2600,
                sides: 3,
                radius: 80,
                color: '#78909C',
                angle: Math.PI
            },
            {
                type: 'rectangle',
                x: 300,
                y: 3000,
                width: 200,
                height: 50,
                color: '#78909C'
            },
            {
                type: 'polygon',
                x: 500,
                y: 3400,
                sides: 3,
                radius: 90,
                color: '#78909C',
                angle: Math.PI
            },
            {
                type: 'rectangle',
                x: 200,
                y: 3800,
                width: 200,
                height: 50,
                color: '#78909C'
            },
            {
                type: 'polygon',
                x: 400,
                y: 4200,
                sides: 3,
                radius: 100,
                color: '#78909C',
                angle: Math.PI
            },
            {
                type: 'rectangle',
                x: 600,
                y: 4600,
                width: 200,
                height: 50,
                color: '#78909C'
            },
            {
                type: 'polygon',
                x: 300,
                y: 5000,
                sides: 3,
                radius: 110,
                color: '#78909C',
                angle: Math.PI
            },
            {
                type: 'rectangle',
                x: 500,
                y: 5400,
                width: 200,
                height: 50,
                color: '#78909C'
            },
            {
                type: 'polygon',
                x: 200,
                y: 5800,
                sides: 3,
                radius: 120,
                color: '#78909C',
                angle: Math.PI
            },
            {
                type: 'rectangle',
                x: 400,
                y: 6200,
                width: 200,
                height: 50,
                color: '#78909C'
            },
            {
                type: 'polygon',
                x: 600,
                y: 6600,
                sides: 3,
                radius: 130,
                color: '#78909C',
                angle: Math.PI
            },
            
            // Middle section - Ice platforms and spikes (10000-25000)
            {
                type: 'rectangle',
                x: 400,
                y: 7500,
                width: 150,
                height: 40,
                color: '#78909C',
                friction: 0.1,
                restitution: 0.8
            },
            {
                type: 'spike',
                x: 200,
                y: 8000,
                width: 40,
                height: 60,
                color: '#FF5252'
            },
            {
                type: 'spike',
                x: 600,
                y: 8000,
                width: 40,
                height: 60,
                color: '#FF5252'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 8500,
                width: 150,
                height: 40,
                color: '#78909C',
                friction: 0.1,
                restitution: 0.8
            },
            {
                type: 'spike',
                x: 250,
                y: 9000,
                width: 50,
                height: 70,
                color: '#FF5252'
            },
            {
                type: 'spike',
                x: 400,
                y: 9000,
                width: 50,
                height: 70,
                color: '#FF5252'
            },
            {
                type: 'spike',
                x: 550,
                y: 9000,
                width: 50,
                height: 70,
                color: '#FF5252'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 9500,
                width: 150,
                height: 40,
                color: '#78909C',
                friction: 0.1,
                restitution: 0.8
            },
            {
                type: 'circle',
                x: 200,
                y: 10500,
                radius: 80,
                color: '#78909C',
                friction: 0.1,
                restitution: 0.9
            },
            {
                type: 'circle',
                x: 600,
                y: 11500,
                radius: 90,
                color: '#78909C',
                friction: 0.1,
                restitution: 0.9
            },
            {
                type: 'circle',
                x: 300,
                y: 12500,
                radius: 100,
                color: '#78909C',
                friction: 0.1,
                restitution: 0.9
            },
            {
                type: 'circle',
                x: 500,
                y: 13500,
                radius: 110,
                color: '#78909C',
                friction: 0.1,
                restitution: 0.9
            },
            {
                type: 'rectangle',
                x: 400,
                y: 15000,
                width: 200, // Reduced width from 600 to 400
                height: 40,
                color: '#78909C',
                friction: 0.1,
                restitution: 0.8
            },
            {
                type: 'spike',
                x: 200,
                y: 16000,
                width: 60,
                height: 80,
                color: '#FF5252'
            },
            {
                type: 'spike',
                x: 350,
                y: 16000,
                width: 60,
                height: 80,
                color: '#FF5252'
            },
            {
                type: 'spike',
                x: 500,
                y: 16000,
                width: 60,
                height: 80,
                color: '#FF5252'
            },
            {
                type: 'spike',
                x: 650,
                y: 16000,
                width: 60,
                height: 80,
                color: '#FF5252'
            },
            
            // Lower section - Avalanche zone (25000-39000)
            {
                type: 'circle',
                x: 200,
                y: 18000,
                radius: 40,
                color: '#FFFFFF',
                isStatic: false,
                density: 0.001
            },
            {
                type: 'circle',
                x: 300,
                y: 18200,
                radius: 35,
                color: '#FFFFFF',
                isStatic: false,
                density: 0.001
            },
            {
                type: 'circle',
                x: 400,
                y: 18400,
                radius: 45,
                color: '#FFFFFF',
                isStatic: false,
                density: 0.001
            },
            {
                type: 'circle',
                x: 500,
                y: 18600,
                radius: 30,
                color: '#FFFFFF',
                isStatic: false,
                density: 0.001
            },
            {
                type: 'circle',
                x: 600,
                y: 18800,
                radius: 50,
                color: '#FFFFFF',
                isStatic: false,
                density: 0.001
            },
            {
                type: 'rectangle',
                x: 400,
                y: 20000,
                width: 200,
                height: 40,
                color: '#78909C',
                friction: 0.1,
                restitution: 0.8
            },
            {
                type: 'circle',
                x: 250,
                y: 22000,
                radius: 55,
                color: '#FFFFFF',
                isStatic: false,
                density: 0.001
            },
            {
                type: 'circle',
                x: 350,
                y: 22200,
                radius: 40,
                color: '#FFFFFF',
                isStatic: false,
                density: 0.001
            },
            {
                type: 'circle',
                x: 450,
                y: 22400,
                radius: 60,
                color: '#FFFFFF',
                isStatic: false,
                density: 0.001
            },
            {
                type: 'circle',
                x: 550,
                y: 22600,
                radius: 45,
                color: '#FFFFFF',
                isStatic: false,
                density: 0.001
            },
            {
                type: 'rectangle',
                x: 400,
                y: 25000,
                width: 200,
                height: 40,
                color: '#78909C',
                friction: 0.1,
                restitution: 0.8
            },
            {
                type: 'rectangle',
                x: 200,
                y: 28000,
                width: 150,
                height: 40,
                color: '#FFEB3B',
                label: 'target'
            },
            {
                type: 'rectangle',
                x: 600,
                y: 28000,
                width: 150,
                height: 40,
                color: '#FFEB3B',
                label: 'target'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 30000,
                width: 150, // Reduced width from 800 to 500
                height: 40,
                color: '#78909C',
                friction: 0.1,
                restitution: 0.8
            },
            {
                type: 'rectangle',
                x: 300,
                y: 33000,
                width: 150,
                height: 40,
                color: '#FFEB3B',
                label: 'target'
            },
            {
                type: 'rectangle',
                x: 500,
                y: 33000,
                width: 150,
                height: 40,
                color: '#FFEB3B',
                label: 'target'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 35000,
                width: 150, // Reduced width from 800 to 500
                height: 40,
                color: '#78909C',
                friction: 0.1,
                restitution: 0.8
            },
            {
                type: 'spike',
                x: 200,
                y: 37000,
                width: 80,
                height: 120,
                color: '#FF5252'
            },
            {
                type: 'spike',
                x: 400,
                y: 37000,
                width: 80,
                height: 120,
                color: '#FF5252'
            },
            {
                type: 'spike',
                x: 600,
                y: 37000,
                width: 80,
                height: 120,
                color: '#FF5252'
            },
            
            // Bottom section - Final target
            {
                type: 'rectangle',
                x: 400,
                y: 39800,
                width: 150,
                height: 40,
                color: '#FFEB3B',
                label: 'target'
            }
        ],
        climbables: [
            {
                x: 150,
                y: 20000,
                width: 20,
                height: 40000,
                color: '#5D4037'
            },
            {
                x: 650,
                y: 20000,
                width: 20,
                height: 40000,
                color: '#5D4037'
            }
        ],
        decorations: [
            // Clouds
            {
                type: 'circle',
                x: 100,
                y: 100,
                radius: 30,
                color: '#FFFFFF'
            },
            {
                type: 'circle',
                x: 130,
                y: 90,
                radius: 40,
                color: '#FFFFFF'
            },
            {
                type: 'circle',
                x: 160,
                y: 100,
                radius: 30,
                color: '#FFFFFF'
            },
            {
                type: 'circle',
                x: 600,
                y: 150,
                radius: 35,
                color: '#FFFFFF'
            },
            {
                type: 'circle',
                x: 630,
                y: 140,
                radius: 45,
                color: '#FFFFFF'
            },
            {
                type: 'circle',
                x: 660,
                y: 150,
                radius: 35,
                color: '#FFFFFF'
            }
        ],
        nextLevel: 'cityRooftops'
    }),
    
    // Level 3: City Rooftops
    cityRooftops: new Level({
        name: 'City Rooftops',
        background: '#546E7A',
        width: 1000,
        height: 40000,  // 20x taller level
        groundY: 39950, // Ground is near the bottom
        playerStartX: 400,
        playerStartY: 100,  // Start at the top
        unlockRequirement: 10,
        description: 'Navigate the urban jungle of skyscraper rooftops.',
        scoreMultiplier: 2,
        windForce: 0.0005,
        obstacles: [
            // Starting platform
            {
                type: 'rectangle',
                x: 400,
                y: 150,
                width: 300,
                height: 30,
                color: '#455A64'
            },
            
            // Upper section - Rooftops (0-10000)
            {
                type: 'rectangle',
                x: 300,
                y: 300,
                width: 200,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 500,
                y: 500,
                width: 200,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 200,
                y: 700,
                width: 200,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 600,
                y: 900,
                width: 200,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 300,
                y: 1100,
                width: 200,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 500,
                y: 1300,
                width: 200,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 250,
                y: 1500,
                width: 200,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 550,
                y: 1700,
                width: 200,
                height: 50,
                color: '#455A64'
            },
            // Air conditioning units
            {
                type: 'rectangle',
                x: 250,
                y: 250,
                width: 50,
                height: 40,
                color: '#78909C'
            },
            {
                type: 'rectangle',
                x: 550,
                y: 450,
                width: 50,
                height: 40,
                color: '#78909C'
            },
            // Antennas
            {
                type: 'rectangle',
                x: 350,
                y: 250,
                width: 5,
                height: 60,
                color: '#9E9E9E'
            },
            {
                type: 'rectangle',
                x: 450,
                y: 450,
                width: 5,
                height: 60,
                color: '#9E9E9E'
            },
            
            // More rooftops and obstacles
            {
                type: 'rectangle',
                x: 400,
                y: 2000,
                width: 250,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 200,
                y: 2300,
                width: 220,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 600,
                y: 2600,
                width: 230,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 350,
                y: 2900,
                width: 240,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 500,
                y: 3200,
                width: 250,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 250,
                y: 3500,
                width: 260,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 550,
                y: 3800,
                width: 270,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 4100,
                width: 280,
                height: 50,
                color: '#455A64'
            },
            
            // Middle section - Billboards and obstacles (10000-25000)
            {
                type: 'rectangle',
                x: 200,
                y: 5000,
                width: 150,
                height: 200,
                color: '#E91E63',
                angle: 0.1
            },
            {
                type: 'rectangle',
                x: 600,
                y: 6000,
                width: 150,
                height: 200,
                color: '#2196F3',
                angle: -0.1
            },
            {
                type: 'rectangle',
                x: 300,
                y: 7000,
                width: 150,
                height: 200,
                color: '#4CAF50',
                angle: 0.15
            },
            {
                type: 'rectangle',
                x: 500,
                y: 8000,
                width: 150,
                height: 200,
                color: '#FFC107',
                angle: -0.15
            },
            {
                type: 'rectangle',
                x: 400,
                y: 9000,
                width: 300,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 200,
                y: 10000,
                width: 250,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 600,
                y: 11000,
                width: 250,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 12000,
                width: 350,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 200,
                y: 13000,
                width: 300,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 600,
                y: 14000,
                width: 300,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 15000,
                width: 300,
                height: 50,
                color: '#455A64'
            },
            
            // Helicopter landing pads
            {
                type: 'circle',
                x: 200,
                y: 16000,
                radius: 100,
                color: '#455A64'
            },
            {
                type: 'circle',
                x: 600,
                y: 17000,
                radius: 100,
                color: '#455A64'
            },
            {
                type: 'circle',
                x: 400,
                y: 18000,
                radius: 120,
                color: '#455A64'
            },
            
            // Lower section - Construction sites (25000-39000)
            {
                type: 'rectangle',
                x: 200,
                y: 20000,
                width: 20,
                height: 300,
                color: '#795548'
            },
            {
                type: 'rectangle',
                x: 300,
                y: 20000,
                width: 20,
                height: 400,
                color: '#795548'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 20000,
                width: 20,
                height: 500,
                color: '#795548'
            },
            {
                type: 'rectangle',
                x: 500,
                y: 20000,
                width: 20,
                height: 400,
                color: '#795548'
            },
            {
                type: 'rectangle',
                x: 600,
                y: 20000,
                width: 20,
                height: 300,
                color: '#795548'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 20250,
                width: 450,
                height: 20,
                color: '#795548'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 20500,
                width: 450,
                height: 20,
                color: '#795548'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 21000,
                width: 300,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 200,
                y: 22000,
                width: 200,
                height: 50,
                color: '#FFEB3B',
                label: 'target'
            },
            {
                type: 'rectangle',
                x: 600,
                y: 22000,
                width: 200,
                height: 50,
                color: '#FFEB3B',
                label: 'target'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 23000,
                width: 300,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 200,
                y: 25000,
                width: 20,
                height: 300,
                color: '#795548'
            },
            {
                type: 'rectangle',
                x: 300,
                y: 25000,
                width: 20,
                height: 400,
                color: '#795548'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 25000,
                width: 20,
                height: 500,
                color: '#795548'
            },
            {
                type: 'rectangle',
                x: 500,
                y: 25000,
                width: 20,
                height: 400,
                color: '#795548'
            },
            {
                type: 'rectangle',
                x: 600,
                y: 25000,
                width: 20,
                height: 300,
                color: '#795548'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 25250,
                width: 450,
                height: 20,
                color: '#795548'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 25500,
                width: 450,
                height: 20,
                color: '#795548'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 26000,
                width: 650,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 300,
                y: 28000,
                width: 250,
                height: 50,
                color: '#FFEB3B',
                label: 'target'
            },
            {
                type: 'rectangle',
                x: 500,
                y: 28000,
                width: 250,
                height: 50,
                color: '#FFEB3B',
                label: 'target'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 30000,
                width: 700,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 200,
                y: 32000,
                width: 300,
                height: 50,
                color: '#FFEB3B',
                label: 'target'
            },
            {
                type: 'rectangle',
                x: 600,
                y: 32000,
                width: 300,
                height: 50,
                color: '#FFEB3B',
                label: 'target'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 34000,
                width: 750,
                height: 50,
                color: '#455A64'
            },
            {
                type: 'rectangle',
                x: 400,
                y: 36000,
                width: 300, // Reduced width from 800 to 500
                height: 50,
                color: '#455A64'
            },
            
            // Bottom section - Final target
            {
                type: 'rectangle',
                x: 400,
                y: 39800,
                width: 300,
                height: 40,
                color: '#FFEB3B',
                label: 'target'
            }
        ],
        climbables: [
            {
                x: 100,
                y: 20000,
                width: 10,
                height: 40000,
                color: '#9E9E9E'
            },
            {
                x: 700,
                y: 20000,
                width: 10,
                height: 40000,
                color: '#9E9E9E'
            }
        ],
        targets: [
            {
                type: 'rectangle',
                x: 300,
                y: 1900,
                width: 50,
                height: 20,
                color: '#FFEB3B',
                points: 2000
            },
            {
                type: 'rectangle',
                x: 500,
                y: 1900,
                width: 50,
                height: 20,
                color: '#FFEB3B',
                points: 3000
            }
        ],
        decorations: [
            // Background buildings
            {
                type: 'rect',
                x: 50,
                y: 200,
                width: 30,
                height: 350,
                color: '#37474F'
            },
            {
                type: 'rect',
                x: 250,
                y: 250,
                width: 40,
                height: 300,
                color: '#37474F'
            },
            {
                type: 'rect',
                x: 450,
                y: 150,
                width: 35,
                height: 400,
                color: '#37474F'
            },
            {
                type: 'rect',
                x: 650,
                y: 200,
                width: 45,
                height: 350,
                color: '#37474F'
            },
            // Windows
            {
                type: 'rect',
                x: 100,
                y: 380,
                width: 20,
                height: 20,
                color: '#FFECB3'
            },
            {
                type: 'rect',
                x: 130,
                y: 380,
                width: 20,
                height: 20,
                color: '#FFECB3'
            },
            {
                type: 'rect',
                x: 100,
                y: 410,
                width: 20,
                height: 20,
                color: '#FFECB3'
            },
            {
                type: 'rect',
                x: 130,
                y: 410,
                width: 20,
                height: 20,
                color: '#FFECB3'
            },
            {
                type: 'rect',
                x: 500,
                y: 350,
                width: 20,
                height: 20,
                color: '#FFECB3'
            },
            {
                type: 'rect',
                x: 530,
                y: 350,
                width: 20,
                height: 20,
                color: '#FFECB3'
            },
            {
                type: 'rect',
                x: 500,
                y: 380,
                width: 20,
                height: 20,
                color: '#FFECB3'
            },
            {
                type: 'rect',
                x: 530,
                y: 380,
                width: 20,
                height: 20,
                color: '#FFECB3'
            }
        ]
    })
};
