/**
 * Bowling Calculator - Handles official bowling scoring rules
 */

class BowlingCalculator {
    constructor() {
        this.TOTAL_FRAMES = 10;
        this.PINS_PER_FRAME = 10;
    }

    /**
     * Calculate the total score for a complete game
     * @param {Array} rolls - Array of pin counts for each roll
     * @returns {number} Total game score
     */
    calculateGameScore(rolls) {
        if (!rolls || rolls.length === 0) return 0;
        
        let score = 0;
        let rollIndex = 0;
        
        for (let frame = 0; frame < this.TOTAL_FRAMES; frame++) {
            if (frame === 9) {
                // 10th frame special rules
                score += this.calculateTenthFrame(rolls, rollIndex);
                break;
            } else if (this.isStrike(rolls[rollIndex])) {
                // Strike
                score += this.calculateStrikeScore(rolls, rollIndex);
                rollIndex += 1;
            } else if (this.isSpare(rolls[rollIndex], rolls[rollIndex + 1])) {
                // Spare
                score += this.calculateSpareScore(rolls, rollIndex);
                rollIndex += 2;
            } else {
                // Normal frame
                score += this.calculateNormalFrame(rolls, rollIndex);
                rollIndex += 2;
            }
        }
        
        return score;
    }

    /**
     * Calculate frame-by-frame scores
     * @param {Array} rolls - Array of pin counts for each roll
     * @returns {Array} Array of cumulative scores for each frame
     */
    calculateFrameScores(rolls) {
        if (!rolls || rolls.length === 0) return [];
        
        const frameScores = [];
        let totalScore = 0;
        let rollIndex = 0;
        
        for (let frame = 0; frame < this.TOTAL_FRAMES; frame++) {
            let frameScore = 0;
            
            if (frame === 9) {
                // 10th frame special rules
                frameScore = this.calculateTenthFrame(rolls, rollIndex);
            } else if (this.isStrike(rolls[rollIndex])) {
                // Strike
                frameScore = this.calculateStrikeScore(rolls, rollIndex);
                rollIndex += 1;
            } else if (this.isSpare(rolls[rollIndex], rolls[rollIndex + 1])) {
                // Spare
                frameScore = this.calculateSpareScore(rolls, rollIndex);
                rollIndex += 2;
            } else {
                // Normal frame
                frameScore = this.calculateNormalFrame(rolls, rollIndex);
                rollIndex += 2;
            }
            
            totalScore += frameScore;
            frameScores.push(totalScore);
        }
        
        return frameScores;
    }

    /**
     * Calculate detailed frame information
     * @param {Array} rolls - Array of pin counts for each roll
     * @returns {Array} Array of frame objects with detailed information
     */
    calculateDetailedFrames(rolls) {
        if (!rolls || rolls.length === 0) return [];
        
        const frames = [];
        let rollIndex = 0;
        let totalScore = 0;
        
        for (let frame = 0; frame < this.TOTAL_FRAMES; frame++) {
            const frameData = {
                frameNumber: frame + 1,
                rolls: [],
                score: 0,
                totalScore: 0,
                isStrike: false,
                isSpare: false,
                bonus: 0
            };
            
            if (frame === 9) {
                // 10th frame special handling
                const remainingRolls = rolls.slice(rollIndex);
                frameData.rolls = remainingRolls;
                frameData.score = this.calculateTenthFrame(rolls, rollIndex);
                
                if (remainingRolls.length >= 2) {
                    frameData.isStrike = this.isStrike(remainingRolls[0]);
                    if (!frameData.isStrike) {
                        frameData.isSpare = this.isSpare(remainingRolls[0], remainingRolls[1]);
                    }
                }
            } else {
                if (this.isStrike(rolls[rollIndex])) {
                    // Strike
                    frameData.rolls = [rolls[rollIndex]];
                    frameData.isStrike = true;
                    frameData.score = this.calculateStrikeScore(rolls, rollIndex);
                    frameData.bonus = this.getStrikeBonus(rolls, rollIndex);
                    rollIndex += 1;
                } else if (rollIndex + 1 < rolls.length && 
                          this.isSpare(rolls[rollIndex], rolls[rollIndex + 1])) {
                    // Spare
                    frameData.rolls = [rolls[rollIndex], rolls[rollIndex + 1]];
                    frameData.isSpare = true;
                    frameData.score = this.calculateSpareScore(rolls, rollIndex);
                    frameData.bonus = this.getSpareBonus(rolls, rollIndex);
                    rollIndex += 2;
                } else {
                    // Normal frame
                    frameData.rolls = [
                        rolls[rollIndex] || 0,
                        rolls[rollIndex + 1] || 0
                    ];
                    frameData.score = this.calculateNormalFrame(rolls, rollIndex);
                    rollIndex += 2;
                }
            }
            
            totalScore += frameData.score;
            frameData.totalScore = totalScore;
            frames.push(frameData);
        }
        
        return frames;
    }

    /**
     * Check if a roll is a strike
     */
    isStrike(roll) {
        return roll === this.PINS_PER_FRAME;
    }

    /**
     * Check if two rolls make a spare
     */
    isSpare(roll1, roll2) {
        return (roll1 || 0) + (roll2 || 0) === this.PINS_PER_FRAME && !this.isStrike(roll1);
    }

    /**
     * Calculate strike score with bonus
     */
    calculateStrikeScore(rolls, rollIndex) {
        let score = this.PINS_PER_FRAME;
        
        // Add bonus from next two rolls
        if (rollIndex + 1 < rolls.length) {
            score += rolls[rollIndex + 1] || 0;
        }
        if (rollIndex + 2 < rolls.length) {
            score += rolls[rollIndex + 2] || 0;
        }
        
        return score;
    }

    /**
     * Calculate spare score with bonus
     */
    calculateSpareScore(rolls, rollIndex) {
        let score = this.PINS_PER_FRAME;
        
        // Add bonus from next roll
        if (rollIndex + 2 < rolls.length) {
            score += rolls[rollIndex + 2] || 0;
        }
        
        return score;
    }

    /**
     * Calculate normal frame score
     */
    calculateNormalFrame(rolls, rollIndex) {
        return (rolls[rollIndex] || 0) + (rolls[rollIndex + 1] || 0);
    }

    /**
     * Calculate 10th frame score (special rules)
     */
    calculateTenthFrame(rolls, rollIndex) {
        const remainingRolls = rolls.slice(rollIndex);
        if (remainingRolls.length === 0) return 0;
        
        let score = 0;
        
        // First roll
        score += remainingRolls[0] || 0;
        
        if (remainingRolls.length > 1) {
            // Second roll
            score += remainingRolls[1] || 0;
            
            // Third roll (if strike or spare)
            if (remainingRolls.length > 2 && 
                (this.isStrike(remainingRolls[0]) || 
                 this.isSpare(remainingRolls[0], remainingRolls[1]))) {
                score += remainingRolls[2] || 0;
            }
        }
        
        return score;
    }

    /**
     * Get strike bonus points
     */
    getStrikeBonus(rolls, rollIndex) {
        let bonus = 0;
        if (rollIndex + 1 < rolls.length) bonus += rolls[rollIndex + 1] || 0;
        if (rollIndex + 2 < rolls.length) bonus += rolls[rollIndex + 2] || 0;
        return bonus;
    }

    /**
     * Get spare bonus points
     */
    getSpareBonus(rolls, rollIndex) {
        return rollIndex + 2 < rolls.length ? (rolls[rollIndex + 2] || 0) : 0;
    }

    /**
     * Calculate game statistics
     * @param {Array} rolls - Array of pin counts for each roll
     * @returns {Object} Statistics object
     */
    calculateGameStatistics(rolls) {
        if (!rolls || rolls.length === 0) {
            return {
                totalScore: 0,
                strikes: 0,
                spares: 0,
                splits: 0,
                gutters: 0,
                averagePerFrame: 0,
                maxConsecutiveStrikes: 0
            };
        }

        const frames = this.calculateDetailedFrames(rolls);
        const totalScore = frames[frames.length - 1]?.totalScore || 0;
        
        let strikes = 0;
        let spares = 0;
        let gutters = 0;
        let consecutiveStrikes = 0;
        let maxConsecutiveStrikes = 0;

        // Count strikes, spares, and gutters
        for (const frame of frames) {
            if (frame.isStrike) {
                strikes++;
                consecutiveStrikes++;
                maxConsecutiveStrikes = Math.max(maxConsecutiveStrikes, consecutiveStrikes);
            } else {
                consecutiveStrikes = 0;
                if (frame.isSpare) {
                    spares++;
                }
            }

            // Count gutters (0 pins)
            for (const roll of frame.rolls) {
                if (roll === 0) gutters++;
            }
        }

        return {
            totalScore,
            strikes,
            spares,
            splits: 0, // Would need additional logic to detect splits
            gutters,
            averagePerFrame: frames.length > 0 ? totalScore / frames.length : 0,
            maxConsecutiveStrikes
        };
    }

    /**
     * Validate a roll input
     * @param {number} pins - Number of pins knocked down
     * @param {number} previousRoll - Previous roll in the same frame (if any)
     * @returns {boolean} True if valid
     */
    validateRoll(pins, previousRoll = 0) {
        if (pins < 0 || pins > this.PINS_PER_FRAME) return false;
        if (previousRoll + pins > this.PINS_PER_FRAME) return false;
        return true;
    }

    /**
     * Get maximum possible score (perfect game)
     * @returns {number} Maximum possible score (300)
     */
    getPerfectScore() {
        return 300;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BowlingCalculator;
} else {
    window.BowlingCalculator = BowlingCalculator;
}