/**
 * Utility functions for the Groin Smashers game
 */

const Utils = {
    /**
     * Generate a random number between min and max (inclusive)
     */
    random: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Calculate distance between two points
     */
    distance: function(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    
    /**
     * Convert degrees to radians
     */
    degToRad: function(degrees) {
        return degrees * Math.PI / 180;
    },
    
    /**
     * Convert radians to degrees
     */
    radToDeg: function(radians) {
        return radians * 180 / Math.PI;
    },
    
    /**
     * Check if a point is inside a rectangle
     */
    pointInRect: function(x, y, rect) {
        return x >= rect.x && 
               x <= rect.x + rect.width && 
               y >= rect.y && 
               y <= rect.y + rect.height;
    },
    
    /**
     * Linear interpolation between two values
     */
    lerp: function(start, end, amt) {
        return (1 - amt) * start + amt * end;
    },
    
    /**
     * Clamp a value between min and max
     */
    clamp: function(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    /**
     * Format a number with commas for thousands
     */
    formatNumber: function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    
    /**
     * Shuffle an array (Fisher-Yates algorithm)
     */
    shuffleArray: function(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },
    
    /**
     * Calculate impact force based on velocity and height
     */
    calculateImpact: function(velocity, height) {
        // Higher velocity and height mean greater impact
        return Math.abs(velocity) * (height / 10);
    },
    
    /**
     * Calculate score based on impact, stunts, and height
     */
    calculateScore: function(impact, stuntMultiplier, height) {
        return Math.floor(impact * stuntMultiplier * (1 + height / 50));
    },
    
    /**
     * Check if two objects are colliding (simple AABB collision)
     */
    checkCollision: function(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
};
