/**
 * Main Application - Bowling Brothers SPA
 */

class BowlingBrothersApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.dataManager = null;
        this.chartManager = null;
        this.gameManager = null;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize managers
            this.dataManager = new DataManager();
            this.chartManager = new ChartManager(this.dataManager);
            this.gameManager = new GameManager(this.dataManager, this.chartManager);

            // Set up navigation
            this.setupNavigation();
            this.setupStatisticsTabs();

            // Load initial data
            this.loadDashboard();
            this.loadPlayerStats();

            console.log('Bowling Brothers App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Erro ao inicializar a aplicação. Recarregue a página.');
        }
    }

    /**
     * Set up navigation between sections
     */
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetSection = e.target.dataset.section;
                this.navigateToSection(targetSection);
            });
        });
    }

    /**
     * Navigate to a specific section
     */
    navigateToSection(sectionName) {
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === sectionName);
        });

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.toggle('active', section.id === sectionName);
        });

        this.currentSection = sectionName;

        // Load section-specific content
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'new-game':
                this.loadNewGame();
                break;
            case 'statistics':
                this.loadStatistics();
                break;
            case 'players':
                this.loadPlayerStats();
                break;
        }
    }

    /**
     * Set up statistics tabs
     */
    setupStatisticsTabs() {
        const statsTabs = document.querySelectorAll('.stats-tab');
        
        statsTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                this.switchStatisticsTab(targetTab);
            });
        });
    }

    /**
     * Switch statistics tabs
     */
    switchStatisticsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.stats-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.stats-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-stats`);
        });

        // Load tab-specific content
        this.loadStatisticsTab(tabName);
    }

    /**
     * Load dashboard content
     */
    loadDashboard() {
        this.updateDashboardStats();
        this.chartManager.initializeDashboardCharts();
    }

    /**
     * Load new game section
     */
    loadNewGame() {
        // Game manager handles this automatically
        console.log('New game section loaded');
    }

    /**
     * Load statistics section
     */
    loadStatistics() {
        this.chartManager.initializeStatisticsCharts();
    }

    /**
     * Load specific statistics tab
     */
    loadStatisticsTab(tabName) {
        switch (tabName) {
            case 'global':
                this.chartManager.createScoreDistributionChart();
                this.chartManager.createStrikesSparesChart();
                break;
            case 'comparison':
                this.chartManager.createComparisonChart();
                break;
            case 'timeline':
                this.chartManager.createTimelineChart();
                break;
        }
    }

    /**
     * Update dashboard statistics
     */
    updateDashboardStats() {
        const globalStats = this.dataManager.calculateGlobalStats();

        // Update stat cards
        this.updateStatElement('best-individual-score', globalStats.bestIndividualScore.score || '---');
        this.updateStatElement('best-individual-player', globalStats.bestIndividualScore.player || '---');
        this.updateStatElement('best-collective-score', globalStats.bestCollectiveScore.score || '---');
        this.updateStatElement('best-collective-date', globalStats.bestCollectiveScore.date || '---');
        this.updateStatElement('total-games', globalStats.totalGames);
        this.updateStatElement('total-strikes', globalStats.totalStrikes);
    }

    /**
     * Load player statistics
     */
    loadPlayerStats() {
        const players = ['brother1', 'brother2', 'brother3'];
        
        players.forEach(playerId => {
            const stats = this.dataManager.calculatePlayerStats(playerId);
            this.updatePlayerCard(playerId, stats);
        });
    }

    /**
     * Update player card with statistics
     */
    updatePlayerCard(playerId, stats) {
        const playerCard = document.querySelector(`.player-card[data-player="${playerId}"]`);
        if (!playerCard) return;

        const statElements = {
            'best-score': stats.bestScore || '---',
            'average': stats.averageScore ? Math.round(stats.averageScore) : '---',
            'strikes': stats.totalStrikes || '---',
            'spares': stats.totalSpares || '---'
        };

        for (const [statName, value] of Object.entries(statElements)) {
            const element = playerCard.querySelector(`[data-stat="${statName}"]`);
            if (element) {
                element.textContent = value;
            }
        }
    }

    /**
     * Update a statistic element
     */
    updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        // Create or show error toast
        let errorToast = document.getElementById('error-toast');
        
        if (!errorToast) {
            errorToast = document.createElement('div');
            errorToast.id = 'error-toast';
            errorToast.className = 'error-toast';
            document.body.appendChild(errorToast);
        }

        errorToast.textContent = message;
        errorToast.classList.add('show');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorToast.classList.remove('show');
        }, 5000);
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        // Create or show success toast
        let successToast = document.getElementById('success-toast');
        
        if (!successToast) {
            successToast = document.createElement('div');
            successToast.id = 'success-toast';
            successToast.className = 'success-toast';
            document.body.appendChild(successToast);
        }

        successToast.textContent = message;
        successToast.classList.add('show');

        // Auto-hide after 3 seconds
        setTimeout(() => {
            successToast.classList.remove('show');
        }, 3000);
    }

    /**
     * Refresh all data and charts
     */
    refreshAll() {
        this.updateDashboardStats();
        this.loadPlayerStats();
        this.chartManager.updateAllCharts();
    }

    /**
     * Export application data
     */
    exportData() {
        try {
            const data = this.dataManager.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `bowling-brothers-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            this.showSuccess('Dados exportados com sucesso!');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showError('Erro ao exportar dados.');
        }
    }

    /**
     * Import application data
     */
    importData(file) {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const success = this.dataManager.importData(e.target.result);
                    if (success) {
                        this.showSuccess('Dados importados com sucesso!');
                        this.refreshAll();
                    } else {
                        this.showError('Erro ao importar dados. Verifique o formato do arquivo.');
                    }
                } catch (error) {
                    console.error('Error parsing imported data:', error);
                    this.showError('Arquivo inválido.');
                }
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('Error importing data:', error);
            this.showError('Erro ao ler arquivo.');
        }
    }

    /**
     * Clear all application data
     */
    clearAllData() {
        if (confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
            this.dataManager.clearAllData();
            this.showSuccess('Todos os dados foram apagados.');
            this.refreshAll();
        }
    }

    /**
     * Add sample data for demonstration
     */
    addSampleData() {
        // Sample game data
        const sampleGames = [
            {
                players: {
                    brother1: { active: true, rolls: [10, 7, 3, 9, 0, 10, 0, 8, 8, 2, 0, 6, 10, 10, 10, 10, 8, 1] },
                    brother2: { active: true, rolls: [9, 1, 8, 2, 7, 3, 10, 10, 10, 8, 1, 9, 0, 8, 2, 7, 3, 6] },
                    brother3: { active: true, rolls: [8, 2, 7, 3, 10, 0, 8, 10, 9, 1, 8, 2, 10, 9, 1, 8, 1] }
                }
            },
            {
                players: {
                    brother1: { active: true, rolls: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10] },
                    brother2: { active: true, rolls: [9, 1, 9, 1, 9, 1, 9, 1, 9, 1, 9, 1, 9, 1, 9, 1, 9, 1, 9, 1, 5] },
                    brother3: { active: true, rolls: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] }
                }
            }
        ];

        sampleGames.forEach(game => {
            this.dataManager.addGameSession(game);
        });

        this.showSuccess('Dados de exemplo adicionados!');
        this.refreshAll();
    }

    /**
     * Get application instance for global access
     */
    static getInstance() {
        if (!window.bowlingBrothersApp) {
            window.bowlingBrothersApp = new BowlingBrothersApp();
        }
        return window.bowlingBrothersApp;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.bowlingBrothersApp = new BowlingBrothersApp();
});

// Handle window resize for charts
window.addEventListener('resize', () => {
    if (window.bowlingBrothersApp && window.bowlingBrothersApp.chartManager) {
        window.bowlingBrothersApp.chartManager.resizeAllCharts();
    }
});

// Add some global utility functions for debugging/development
window.addSampleData = () => {
    if (window.bowlingBrothersApp) {
        window.bowlingBrothersApp.addSampleData();
    }
};

window.exportData = () => {
    if (window.bowlingBrothersApp) {
        window.bowlingBrothersApp.exportData();
    }
};

window.clearData = () => {
    if (window.bowlingBrothersApp) {
        window.bowlingBrothersApp.clearAllData();
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BowlingBrothersApp;
} else {
    window.BowlingBrothersApp = BowlingBrothersApp;
}