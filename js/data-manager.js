/**
 * Data Manager - Handles data persistence and statistics calculations
 */

class DataManager {
    constructor() {
        this.STORAGE_KEY = 'bowling_brothers_data';
        this.calculator = new BowlingCalculator();
        this.data = this.loadData();
    }

    /**
     * Load data from localStorage
     */
    loadData() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }
        
        return this.getDefaultData();
    }

    /**
     * Save data to localStorage
     */
    saveData() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    }

    /**
     * Get default data structure
     */
    getDefaultData() {
        return {
            players: {
                brother1: { name: 'Irmão 1', games: [] },
                brother2: { name: 'Irmão 2', games: [] },
                brother3: { name: 'Irmão 3', games: [] }
            },
            sessions: []
        };
    }

    /**
     * Add a new game session
     * @param {Object} gameData - Game data containing player scores
     */
    addGameSession(gameData) {
        const session = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            players: gameData.players,
            games: {}
        };

        // Process each player's game
        for (const [playerId, playerData] of Object.entries(gameData.players)) {
            if (playerData.active && playerData.rolls) {
                const gameStats = this.calculator.calculateGameStatistics(playerData.rolls);
                const frameScores = this.calculator.calculateFrameScores(playerData.rolls);
                const detailedFrames = this.calculator.calculateDetailedFrames(playerData.rolls);
                
                const game = {
                    playerId,
                    rolls: playerData.rolls,
                    totalScore: gameStats.totalScore,
                    frameScores,
                    detailedFrames,
                    statistics: gameStats,
                    date: session.date
                };

                // Add to session
                session.games[playerId] = game;

                // Add to player's games
                this.data.players[playerId].games.push(game);
            }
        }

        // Add session
        this.data.sessions.push(session);
        this.saveData();
        
        return session;
    }

    /**
     * Get all games for a player
     * @param {string} playerId - Player ID
     * @returns {Array} Array of games
     */
    getPlayerGames(playerId) {
        return this.data.players[playerId]?.games || [];
    }

    /**
     * Get all sessions
     * @returns {Array} Array of game sessions
     */
    getAllSessions() {
        return this.data.sessions || [];
    }

    /**
     * Calculate player statistics
     * @param {string} playerId - Player ID
     * @returns {Object} Player statistics
     */
    calculatePlayerStats(playerId) {
        const games = this.getPlayerGames(playerId);
        
        if (games.length === 0) {
            return {
                gamesPlayed: 0,
                bestScore: 0,
                worstScore: 0,
                averageScore: 0,
                totalStrikes: 0,
                totalSpares: 0,
                totalGutters: 0,
                maxConsecutiveStrikes: 0,
                perfectGames: 0,
                averageStrikes: 0,
                averageSpares: 0,
                improvementTrend: 0
            };
        }

        const scores = games.map(game => game.totalScore);
        const totalScore = scores.reduce((sum, score) => sum + score, 0);
        const totalStrikes = games.reduce((sum, game) => sum + game.statistics.strikes, 0);
        const totalSpares = games.reduce((sum, game) => sum + game.statistics.spares, 0);
        const totalGutters = games.reduce((sum, game) => sum + game.statistics.gutters, 0);
        const maxConsecutiveStrikes = Math.max(...games.map(game => game.statistics.maxConsecutiveStrikes));
        const perfectGames = games.filter(game => game.totalScore === 300).length;

        // Calculate improvement trend (last 5 games vs previous 5 games)
        let improvementTrend = 0;
        if (games.length >= 6) {
            const recent = games.slice(-5);
            const previous = games.slice(-10, -5);
            const recentAvg = recent.reduce((sum, game) => sum + game.totalScore, 0) / recent.length;
            const previousAvg = previous.reduce((sum, game) => sum + game.totalScore, 0) / previous.length;
            improvementTrend = recentAvg - previousAvg;
        }

        return {
            gamesPlayed: games.length,
            bestScore: Math.max(...scores),
            worstScore: Math.min(...scores),
            averageScore: totalScore / games.length,
            totalStrikes,
            totalSpares,
            totalGutters,
            maxConsecutiveStrikes,
            perfectGames,
            averageStrikes: totalStrikes / games.length,
            averageSpares: totalSpares / games.length,
            improvementTrend: Math.round(improvementTrend * 10) / 10
        };
    }

    /**
     * Calculate global statistics
     * @returns {Object} Global statistics
     */
    calculateGlobalStats() {
        const sessions = this.getAllSessions();
        
        if (sessions.length === 0) {
            return {
                totalSessions: 0,
                totalGames: 0,
                bestIndividualScore: { score: 0, player: '', date: '' },
                bestCollectiveScore: { score: 0, date: '', players: [] },
                totalStrikes: 0,
                totalSpares: 0,
                averageGameScore: 0,
                mostActivePlayer: '',
                bestDay: { date: '', totalScore: 0 }
            };
        }

        let totalGames = 0;
        let totalScore = 0;
        let totalStrikes = 0;
        let totalSpares = 0;
        let bestIndividual = { score: 0, player: '', date: '' };
        let bestCollective = { score: 0, date: '', players: [] };
        const playerGameCounts = { brother1: 0, brother2: 0, brother3: 0 };
        const dayTotals = {};

        // Process all sessions
        for (const session of sessions) {
            let sessionTotal = 0;
            const sessionPlayers = [];

            for (const [playerId, game] of Object.entries(session.games)) {
                totalGames++;
                totalScore += game.totalScore;
                totalStrikes += game.statistics.strikes;
                totalSpares += game.statistics.spares;
                sessionTotal += game.totalScore;
                sessionPlayers.push(playerId);
                playerGameCounts[playerId]++;

                // Check for best individual score
                if (game.totalScore > bestIndividual.score) {
                    bestIndividual = {
                        score: game.totalScore,
                        player: this.data.players[playerId].name,
                        date: new Date(session.date).toLocaleDateString('pt-BR')
                    };
                }
            }

            // Check for best collective score
            if (sessionTotal > bestCollective.score) {
                bestCollective = {
                    score: sessionTotal,
                    date: new Date(session.date).toLocaleDateString('pt-BR'),
                    players: sessionPlayers.map(id => this.data.players[id].name)
                };
            }

            // Track daily totals
            const dateKey = new Date(session.date).toDateString();
            dayTotals[dateKey] = (dayTotals[dateKey] || 0) + sessionTotal;
        }

        // Find most active player
        const mostActivePlayerId = Object.keys(playerGameCounts)
            .reduce((a, b) => playerGameCounts[a] > playerGameCounts[b] ? a : b);
        const mostActivePlayer = this.data.players[mostActivePlayerId].name;

        // Find best day
        const bestDayEntry = Object.entries(dayTotals)
            .reduce((best, [date, score]) => score > best.score ? { date, score } : best, 
                   { date: '', score: 0 });

        return {
            totalSessions: sessions.length,
            totalGames,
            bestIndividualScore: bestIndividual,
            bestCollectiveScore: bestCollective,
            totalStrikes,
            totalSpares,
            averageGameScore: totalGames > 0 ? Math.round(totalScore / totalGames) : 0,
            mostActivePlayer,
            bestDay: {
                date: bestDayEntry.date ? new Date(bestDayEntry.date).toLocaleDateString('pt-BR') : '',
                totalScore: bestDayEntry.score
            }
        };
    }

    /**
     * Get data for charts
     * @param {string} type - Chart type ('score-evolution', 'comparison', 'distribution', etc.)
     * @returns {Object} Chart data
     */
    getChartData(type) {
        switch (type) {
            case 'score-evolution':
                return this.getScoreEvolutionData();
            case 'comparison':
                return this.getComparisonData();
            case 'distribution':
                return this.getScoreDistributionData();
            case 'strikes-spares':
                return this.getStrikesSparesData();
            case 'timeline':
                return this.getTimelineData();
            default:
                return null;
        }
    }

    /**
     * Get score evolution data for charts
     */
    getScoreEvolutionData() {
        const players = ['brother1', 'brother2', 'brother3'];
        const datasets = [];
        const colors = ['#58a6ff', '#3fb950', '#d29922'];

        players.forEach((playerId, index) => {
            const games = this.getPlayerGames(playerId);
            const scores = games.map(game => game.totalScore);
            
            datasets.push({
                label: this.data.players[playerId].name,
                data: scores,
                borderColor: colors[index],
                backgroundColor: colors[index] + '20',
                tension: 0.3
            });
        });

        return {
            labels: Array.from({ length: Math.max(...datasets.map(d => d.data.length)) }, 
                              (_, i) => `Jogo ${i + 1}`),
            datasets
        };
    }

    /**
     * Get comparison data for charts
     */
    getComparisonData() {
        const players = ['brother1', 'brother2', 'brother3'];
        const stats = players.map(playerId => this.calculatePlayerStats(playerId));
        
        return {
            labels: players.map(playerId => this.data.players[playerId].name),
            datasets: [
                {
                    label: 'Pontuação Média',
                    data: stats.map(stat => Math.round(stat.averageScore)),
                    backgroundColor: '#58a6ff',
                },
                {
                    label: 'Melhor Pontuação',
                    data: stats.map(stat => stat.bestScore),
                    backgroundColor: '#3fb950',
                },
                {
                    label: 'Strikes Médios',
                    data: stats.map(stat => Math.round(stat.averageStrikes * 10) / 10),
                    backgroundColor: '#d29922',
                }
            ]
        };
    }

    /**
     * Get score distribution data
     */
    getScoreDistributionData() {
        const allGames = Object.values(this.data.players)
            .flatMap(player => player.games);
        
        const ranges = [
            { label: '0-50', min: 0, max: 50 },
            { label: '51-100', min: 51, max: 100 },
            { label: '101-150', min: 101, max: 150 },
            { label: '151-200', min: 151, max: 200 },
            { label: '201-250', min: 201, max: 250 },
            { label: '251-300', min: 251, max: 300 }
        ];

        const distribution = ranges.map(range => 
            allGames.filter(game => 
                game.totalScore >= range.min && game.totalScore <= range.max
            ).length
        );

        return {
            labels: ranges.map(r => r.label),
            datasets: [{
                data: distribution,
                backgroundColor: [
                    '#f85149',
                    '#d29922', 
                    '#58a6ff',
                    '#3fb950',
                    '#a5a5a5',
                    '#8b949e'
                ]
            }]
        };
    }

    /**
     * Get strikes vs spares data
     */
    getStrikesSparesData() {
        const players = ['brother1', 'brother2', 'brother3'];
        const playerStats = players.map(playerId => this.calculatePlayerStats(playerId));
        
        return {
            labels: players.map(playerId => this.data.players[playerId].name),
            datasets: [
                {
                    label: 'Strikes',
                    data: playerStats.map(stats => stats.totalStrikes),
                    backgroundColor: '#3fb950'
                },
                {
                    label: 'Spares',
                    data: playerStats.map(stats => stats.totalSpares),
                    backgroundColor: '#58a6ff'
                }
            ]
        };
    }

    /**
     * Get timeline data
     */
    getTimelineData() {
        const sessions = this.getAllSessions().sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = sessions.map(session => new Date(session.date).toLocaleDateString('pt-BR'));
        
        const players = ['brother1', 'brother2', 'brother3'];
        const colors = ['#58a6ff', '#3fb950', '#d29922'];
        const datasets = [];

        players.forEach((playerId, index) => {
            const scores = sessions.map(session => 
                session.games[playerId]?.totalScore || null
            );
            
            datasets.push({
                label: this.data.players[playerId].name,
                data: scores,
                borderColor: colors[index],
                backgroundColor: colors[index] + '20',
                tension: 0.3,
                spanGaps: true
            });
        });

        return { labels, datasets };
    }

    /**
     * Clear all data
     */
    clearAllData() {
        this.data = this.getDefaultData();
        this.saveData();
    }

    /**
     * Export data
     * @returns {string} JSON string of all data
     */
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    /**
     * Import data
     * @param {string} jsonData - JSON string of data to import
     */
    importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            this.data = importedData;
            this.saveData();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
} else {
    window.DataManager = DataManager;
}