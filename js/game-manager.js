/**
 * Game Manager - Handles game UI and user interactions
 */

class GameManager {
    constructor(dataManager, chartManager) {
        this.dataManager = dataManager;
        this.chartManager = chartManager;
        this.calculator = new BowlingCalculator();
        this.currentGame = this.initializeGame();
        this.init();
    }

    /**
     * Initialize game manager
     */
    init() {
        this.bindEvents();
        this.renderGameBoard();
    }

    /**
     * Initialize empty game state
     */
    initializeGame() {
        return {
            players: {
                brother1: { name: 'Irmão 1', active: true, rolls: [], currentFrame: 0, currentRoll: 0 },
                brother2: { name: 'Irmão 2', active: true, rolls: [], currentFrame: 0, currentRoll: 0 },
                brother3: { name: 'Irmão 3', active: true, rolls: [], currentFrame: 0, currentRoll: 0 }
            }
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Player selection checkboxes
        document.querySelectorAll('.player-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const playerId = e.target.value;
                this.currentGame.players[playerId].active = e.target.checked;
                this.renderGameBoard();
            });
        });

        // Game action buttons
        document.getElementById('reset-game')?.addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('save-game')?.addEventListener('click', () => {
            this.saveGame();
        });
    }

    /**
     * Render the game board
     */
    renderGameBoard() {
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) return;

        gameBoard.innerHTML = '';

        // Render each active player's game
        for (const [playerId, player] of Object.entries(this.currentGame.players)) {
            if (player.active) {
                const playerGame = this.createPlayerGameElement(playerId, player);
                gameBoard.appendChild(playerGame);
            }
        }
    }

    /**
     * Create player game element
     */
    createPlayerGameElement(playerId, player) {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-game';
        playerDiv.dataset.playerId = playerId;

        const playerHeader = document.createElement('div');
        playerHeader.className = 'player-name';
        playerHeader.innerHTML = `
            <div class="player-avatar">${playerId.slice(-1)}</div>
            ${player.name}
        `;

        const framesContainer = document.createElement('div');
        framesContainer.className = 'frames-container';

        // Create 10 frames
        for (let frame = 0; frame < 10; frame++) {
            const frameElement = this.createFrameElement(playerId, frame, player.rolls);
            framesContainer.appendChild(frameElement);
        }

        const totalScoreElement = this.createTotalScoreElement(playerId, player.rolls);

        playerDiv.appendChild(playerHeader);
        playerDiv.appendChild(framesContainer);
        playerDiv.appendChild(totalScoreElement);

        return playerDiv;
    }

    /**
     * Create frame element
     */
    createFrameElement(playerId, frameNumber, rolls) {
        const frameDiv = document.createElement('div');
        frameDiv.className = `frame ${frameNumber === 9 ? 'frame-10' : ''}`;

        const frameNumberDiv = document.createElement('div');
        frameNumberDiv.className = 'frame-number';
        frameNumberDiv.textContent = frameNumber + 1;

        const rollsDiv = document.createElement('div');
        rollsDiv.className = 'frame-rolls';

        // Calculate which rolls belong to this frame
        const frameData = this.getFrameRolls(frameNumber, rolls);
        
        if (frameNumber === 9) {
            // 10th frame can have up to 3 rolls
            for (let roll = 0; roll < 3; roll++) {
                const input = this.createRollInput(playerId, frameNumber, roll, frameData.rolls[roll]);
                rollsDiv.appendChild(input);
            }
        } else {
            // Regular frames have up to 2 rolls
            for (let roll = 0; roll < 2; roll++) {
                const input = this.createRollInput(playerId, frameNumber, roll, frameData.rolls[roll]);
                rollsDiv.appendChild(input);
                
                // If it's a strike, don't show second roll input
                if (roll === 0 && frameData.rolls[0] === 10) {
                    break;
                }
            }
        }

        const frameTotal = document.createElement('div');
        frameTotal.className = 'frame-total';
        frameTotal.textContent = this.getFrameScore(frameNumber, rolls);

        frameDiv.appendChild(frameNumberDiv);
        frameDiv.appendChild(rollsDiv);
        frameDiv.appendChild(frameTotal);

        return frameDiv;
    }

    /**
     * Create roll input element
     */
    createRollInput(playerId, frameNumber, rollNumber, value) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'roll-input';
        input.min = 0;
        input.max = 10;
        input.value = value !== undefined ? value : '';
        input.dataset.playerId = playerId;
        input.dataset.frame = frameNumber;
        input.dataset.roll = rollNumber;

        input.addEventListener('input', (e) => {
            this.handleRollInput(e);
        });

        input.addEventListener('focus', (e) => {
            e.target.select();
        });

        return input;
    }

    /**
     * Handle roll input changes
     */
    handleRollInput(event) {
        const input = event.target;
        const playerId = input.dataset.playerId;
        const frameNumber = parseInt(input.dataset.frame);
        const rollNumber = parseInt(input.dataset.roll);
        const value = parseInt(input.value) || 0;

        // Validate input
        if (!this.validateRollInput(playerId, frameNumber, rollNumber, value)) {
            input.value = '';
            return;
        }

        // Update rolls array
        this.updatePlayerRolls(playerId, frameNumber, rollNumber, value);

        // Re-render the game board to update totals
        this.renderGameBoard();
    }

    /**
     * Validate roll input
     */
    validateRollInput(playerId, frameNumber, rollNumber, value) {
        if (value < 0 || value > 10) return false;

        const player = this.currentGame.players[playerId];
        const frameData = this.getFrameRolls(frameNumber, player.rolls);

        if (frameNumber === 9) {
            // 10th frame validation
            if (rollNumber === 0) {
                return value <= 10;
            } else if (rollNumber === 1) {
                // If first roll was not a strike, total can't exceed 10
                if (frameData.rolls[0] < 10) {
                    return (frameData.rolls[0] + value) <= 10;
                }
                return value <= 10;
            } else if (rollNumber === 2) {
                // Third roll only allowed if strike or spare in first two
                const firstTwo = frameData.rolls[0] + (frameData.rolls[1] || 0);
                if (frameData.rolls[0] === 10 || firstTwo === 10) {
                    if (frameData.rolls[1] < 10) {
                        return (frameData.rolls[1] + value) <= 10;
                    }
                    return value <= 10;
                }
                return false;
            }
        } else {
            // Regular frame validation
            if (rollNumber === 0) {
                return value <= 10;
            } else if (rollNumber === 1) {
                return (frameData.rolls[0] + value) <= 10;
            }
        }

        return true;
    }

    /**
     * Update player rolls array
     */
    updatePlayerRolls(playerId, frameNumber, rollNumber, value) {
        const player = this.currentGame.players[playerId];
        
        // Calculate the absolute roll index
        let rollIndex = 0;
        for (let f = 0; f < frameNumber; f++) {
            const frameRolls = this.getFrameRolls(f, player.rolls);
            if (f === 9) {
                rollIndex += frameRolls.rolls.filter(r => r !== undefined).length;
            } else {
                rollIndex += frameRolls.rolls[0] === 10 ? 1 : 2;
            }
        }
        rollIndex += rollNumber;

        // Ensure rolls array is long enough
        while (player.rolls.length <= rollIndex) {
            player.rolls.push(0);
        }

        player.rolls[rollIndex] = value;

        // Remove trailing zeros
        while (player.rolls.length > 0 && player.rolls[player.rolls.length - 1] === 0) {
            const lastRollFrame = this.getRollFrame(player.rolls.length - 1);
            const lastRollInFrame = this.getRollInFrame(player.rolls.length - 1);
            
            // Don't remove if it's a meaningful zero (second roll of a non-strike)
            if (lastRollFrame < 9 && lastRollInFrame === 1 && player.rolls[player.rolls.length - 2] < 10) {
                break;
            }
            
            player.rolls.pop();
        }
    }

    /**
     * Get rolls for a specific frame
     */
    getFrameRolls(frameNumber, rolls) {
        let rollIndex = 0;
        
        // Find the starting roll index for this frame
        for (let f = 0; f < frameNumber; f++) {
            if (f === 9) break; // 10th frame is handled separately
            
            if (rolls[rollIndex] === 10) {
                rollIndex += 1; // Strike
            } else {
                rollIndex += 2; // Normal frame
            }
        }

        const frameRolls = [];
        
        if (frameNumber === 9) {
            // 10th frame can have up to 3 rolls
            for (let i = 0; i < 3; i++) {
                frameRolls.push(rolls[rollIndex + i]);
            }
        } else {
            // Regular frames
            frameRolls.push(rolls[rollIndex]);
            if (rolls[rollIndex] !== 10) {
                frameRolls.push(rolls[rollIndex + 1]);
            }
        }

        return { rolls: frameRolls, startIndex: rollIndex };
    }

    /**
     * Get frame score display
     */
    getFrameScore(frameNumber, rolls) {
        const frameScores = this.calculator.calculateFrameScores(rolls);
        return frameScores[frameNumber] !== undefined ? frameScores[frameNumber] : '';
    }

    /**
     * Get which frame a roll index belongs to
     */
    getRollFrame(rollIndex) {
        let currentRoll = 0;
        for (let frame = 0; frame < 10; frame++) {
            if (frame === 9) {
                return 9; // Any remaining rolls are in frame 10
            }
            
            if (currentRoll === rollIndex) return frame;
            
            // Check if this frame is a strike
            if (currentRoll < this.currentGame.players.brother1.rolls.length && 
                this.currentGame.players.brother1.rolls[currentRoll] === 10) {
                currentRoll += 1;
            } else {
                currentRoll += 2;
            }
            
            if (currentRoll > rollIndex) return frame;
        }
        return 9;
    }

    /**
     * Get which roll within a frame
     */
    getRollInFrame(rollIndex) {
        const frame = this.getRollFrame(rollIndex);
        let frameStartRoll = 0;
        
        for (let f = 0; f < frame; f++) {
            if (f === 9) break;
            
            if (this.currentGame.players.brother1.rolls[frameStartRoll] === 10) {
                frameStartRoll += 1;
            } else {
                frameStartRoll += 2;
            }
        }
        
        return rollIndex - frameStartRoll;
    }

    /**
     * Create total score element
     */
    createTotalScoreElement(playerId, rolls) {
        const totalDiv = document.createElement('div');
        totalDiv.className = 'total-score';

        const label = document.createElement('div');
        label.className = 'total-score-label';
        label.textContent = 'Total';

        const value = document.createElement('div');
        value.className = 'total-score-value';
        value.textContent = this.calculator.calculateGameScore(rolls);

        totalDiv.appendChild(label);
        totalDiv.appendChild(value);

        return totalDiv;
    }

    /**
     * Reset current game
     */
    resetGame() {
        if (confirm('Tem certeza que deseja resetar a partida atual?')) {
            this.currentGame = this.initializeGame();
            
            // Reset checkboxes
            document.querySelectorAll('.player-checkbox input').forEach(checkbox => {
                checkbox.checked = true;
            });
            
            this.renderGameBoard();
        }
    }

    /**
     * Save current game
     */
    saveGame() {
        // Validate that at least one player has some rolls
        const hasValidGame = Object.values(this.currentGame.players).some(player => 
            player.active && player.rolls.length > 0 && player.rolls.some(roll => roll > 0)
        );

        if (!hasValidGame) {
            alert('Por favor, adicione pelo menos algumas jogadas antes de salvar.');
            return;
        }

        // Save the game
        const session = this.dataManager.addGameSession(this.currentGame);
        
        if (session) {
            alert('Partida salva com sucesso!');
            
            // Reset the game
            this.currentGame = this.initializeGame();
            this.renderGameBoard();
            
            // Update charts and statistics
            this.chartManager.updateAllCharts();
            this.updateDashboardStats();
            this.updatePlayerStats();
        } else {
            alert('Erro ao salvar a partida. Tente novamente.');
        }
    }

    /**
     * Update dashboard statistics
     */
    updateDashboardStats() {
        const globalStats = this.dataManager.calculateGlobalStats();

        // Update stat cards
        const bestIndividualScore = document.getElementById('best-individual-score');
        const bestIndividualPlayer = document.getElementById('best-individual-player');
        const bestCollectiveScore = document.getElementById('best-collective-score');
        const bestCollectiveDate = document.getElementById('best-collective-date');
        const totalGames = document.getElementById('total-games');
        const totalStrikes = document.getElementById('total-strikes');

        if (bestIndividualScore) {
            bestIndividualScore.textContent = globalStats.bestIndividualScore.score || '---';
        }
        if (bestIndividualPlayer) {
            bestIndividualPlayer.textContent = globalStats.bestIndividualScore.player || '---';
        }
        if (bestCollectiveScore) {
            bestCollectiveScore.textContent = globalStats.bestCollectiveScore.score || '---';
        }
        if (bestCollectiveDate) {
            bestCollectiveDate.textContent = globalStats.bestCollectiveScore.date || '---';
        }
        if (totalGames) {
            totalGames.textContent = globalStats.totalGames;
        }
        if (totalStrikes) {
            totalStrikes.textContent = globalStats.totalStrikes;
        }
    }

    /**
     * Update player statistics
     */
    updatePlayerStats() {
        const players = ['brother1', 'brother2', 'brother3'];
        
        players.forEach(playerId => {
            const stats = this.dataManager.calculatePlayerStats(playerId);
            const playerCard = document.querySelector(`.player-card[data-player="${playerId}"]`);
            
            if (playerCard) {
                const bestScore = playerCard.querySelector('[data-stat="best-score"]');
                const average = playerCard.querySelector('[data-stat="average"]');
                const strikes = playerCard.querySelector('[data-stat="strikes"]');
                const spares = playerCard.querySelector('[data-stat="spares"]');

                if (bestScore) bestScore.textContent = stats.bestScore || '---';
                if (average) average.textContent = stats.averageScore ? Math.round(stats.averageScore) : '---';
                if (strikes) strikes.textContent = stats.totalStrikes || '---';
                if (spares) spares.textContent = stats.totalSpares || '---';
            }
        });
    }

    /**
     * Get current game state
     */
    getCurrentGame() {
        return this.currentGame;
    }

    /**
     * Load game from data (for editing)
     */
    loadGame(gameData) {
        this.currentGame = gameData;
        this.renderGameBoard();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameManager;
} else {
    window.GameManager = GameManager;
}