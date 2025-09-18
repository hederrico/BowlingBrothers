/**
 * Chart Manager - Handles Chart.js integration and chart rendering
 */

class ChartManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.charts = {};
        this.defaultOptions = this.getDefaultChartOptions();
    }

    /**
     * Get default chart options with dark theme
     */
    getDefaultChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#f0f6fc',
                        font: {
                            family: 'Lexend',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#21262d',
                    titleColor: '#f0f6fc',
                    bodyColor: '#8b949e',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    titleFont: {
                        family: 'Lexend',
                        weight: 'bold'
                    },
                    bodyFont: {
                        family: 'JetBrains Mono'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#8b949e',
                        font: {
                            family: 'Lexend',
                            size: 11
                        }
                    },
                    grid: {
                        color: '#30363d'
                    },
                    border: {
                        color: '#30363d'
                    }
                },
                y: {
                    ticks: {
                        color: '#8b949e',
                        font: {
                            family: 'JetBrains Mono',
                            size: 11
                        }
                    },
                    grid: {
                        color: '#30363d'
                    },
                    border: {
                        color: '#30363d'
                    }
                }
            }
        };
    }

    /**
     * Create or update a chart
     * @param {string} canvasId - Canvas element ID
     * @param {string} type - Chart type
     * @param {Object} data - Chart data
     * @param {Object} options - Additional options
     */
    createChart(canvasId, type, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element with ID "${canvasId}" not found`);
            return null;
        }

        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        // Check if Chart.js is available
        if (typeof Chart === 'undefined' || !Chart) {
            console.warn('Chart.js not available, showing empty chart state');
            this.showEmptyChart(canvasId, 'Charts não disponíveis', 'Chart.js library não carregou');
            return null;
        }

        // Merge options with defaults
        const chartOptions = this.mergeOptions(type, options);

        try {
            // Create new chart
            this.charts[canvasId] = new Chart(canvas, {
                type: type,
                data: data,
                options: chartOptions
            });

            this.hideEmptyChart(canvasId);
            return this.charts[canvasId];
        } catch (error) {
            console.error('Error creating chart:', error);
            this.showEmptyChart(canvasId, 'Erro no gráfico', 'Falha ao criar visualização');
            return null;
        }
    }

    /**
     * Merge options with defaults based on chart type
     */
    mergeOptions(type, customOptions) {
        const baseOptions = JSON.parse(JSON.stringify(this.defaultOptions));
        
        // Type-specific options
        switch (type) {
            case 'line':
                baseOptions.elements = {
                    line: {
                        tension: 0.3
                    },
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                };
                break;
                
            case 'doughnut':
            case 'pie':
                delete baseOptions.scales; // Remove scales for pie/doughnut charts
                baseOptions.plugins.legend.position = 'right';
                break;
                
            case 'radar':
                delete baseOptions.scales; // Remove scales for radar charts
                baseOptions.scales = {
                    r: {
                        ticks: {
                            color: '#8b949e',
                            backdropColor: 'transparent'
                        },
                        grid: {
                            color: '#30363d'
                        },
                        angleLines: {
                            color: '#30363d'
                        }
                    }
                };
                break;
        }

        // Deep merge custom options
        return this.deepMerge(baseOptions, customOptions);
    }

    /**
     * Deep merge objects
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    /**
     * Initialize dashboard charts
     */
    initializeDashboardCharts() {
        this.createScoreEvolutionChart();
    }

    /**
     * Create score evolution chart
     */
    createScoreEvolutionChart() {
        const data = this.dataManager.getChartData('score-evolution');
        
        if (!data || !data.datasets || data.datasets.every(d => d.data.length === 0)) {
            this.showEmptyChart('score-evolution-chart', 'Nenhum dado disponível', 'Adicione algumas partidas para ver a evolução dos scores');
            return;
        }

        this.createChart('score-evolution-chart', 'line', data, {
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 300,
                    ticks: {
                        callback: function(value) {
                            return value + ' pts';
                        }
                    }
                }
            }
        });
    }

    /**
     * Initialize statistics charts
     */
    initializeStatisticsCharts() {
        this.createScoreDistributionChart();
        this.createStrikesSparesChart();
        this.createComparisonChart();
        this.createTimelineChart();
    }

    /**
     * Create score distribution chart
     */
    createScoreDistributionChart() {
        const data = this.dataManager.getChartData('distribution');
        
        if (!data || data.datasets[0].data.every(d => d === 0)) {
            this.showEmptyChart('score-distribution-chart', 'Sem dados de distribuição', 'Jogue algumas partidas para ver a distribuição de scores');
            return;
        }

        this.createChart('score-distribution-chart', 'doughnut', data, {
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        });
    }

    /**
     * Create strikes vs spares chart
     */
    createStrikesSparesChart() {
        const data = this.dataManager.getChartData('strikes-spares');
        
        if (!data || data.datasets.every(d => d.data.every(v => v === 0))) {
            this.showEmptyChart('strikes-spares-chart', 'Sem dados de strikes/spares', 'Faça alguns strikes e spares para ver as estatísticas');
            return;
        }

        this.createChart('strikes-spares-chart', 'bar', data, {
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        });
    }

    /**
     * Create comparison chart
     */
    createComparisonChart() {
        const data = this.dataManager.getChartData('comparison');
        
        if (!data || data.datasets.every(d => d.data.every(v => v === 0))) {
            this.showEmptyChart('comparison-chart', 'Sem dados para comparação', 'Todos os irmãos precisam jogar para comparar performances');
            return;
        }

        this.createChart('comparison-chart', 'radar', data, {
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: Math.max(...data.datasets.flatMap(d => d.data)) + 20
                }
            }
        });
    }

    /**
     * Create timeline chart
     */
    createTimelineChart() {
        const data = this.dataManager.getChartData('timeline');
        
        if (!data || data.datasets.every(d => d.data.every(v => v === null))) {
            this.showEmptyChart('timeline-chart', 'Nenhuma evolução temporal', 'Jogue ao longo do tempo para ver a evolução');
            return;
        }

        this.createChart('timeline-chart', 'line', data, {
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 300
                }
            },
            elements: {
                line: {
                    tension: 0.4
                }
            }
        });
    }

    /**
     * Show empty chart with message
     */
    showEmptyChart(canvasId, title, subtitle) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const container = canvas.parentElement;
        
        // Hide canvas
        canvas.style.display = 'none';
        
        // Create or update empty state
        let emptyState = container.querySelector('.chart-empty');
        if (!emptyState) {
            emptyState = document.createElement('div');
            emptyState.className = 'chart-empty';
            container.appendChild(emptyState);
        }
        
        emptyState.innerHTML = `
            <div class="chart-empty-icon">📊</div>
            <div class="chart-empty-message">${title}</div>
            <div class="chart-empty-subtitle">${subtitle}</div>
        `;
        
        emptyState.style.display = 'flex';
    }

    /**
     * Hide empty chart state and show canvas
     */
    hideEmptyChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const container = canvas.parentElement;
        const emptyState = container.querySelector('.chart-empty');
        
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        canvas.style.display = 'block';
    }

    /**
     * Update all charts with fresh data
     */
    updateAllCharts() {
        // Update dashboard charts
        this.createScoreEvolutionChart();
        
        // Update statistics charts
        this.createScoreDistributionChart();
        this.createStrikesSparesChart();
        this.createComparisonChart();
        this.createTimelineChart();
    }

    /**
     * Destroy all charts
     */
    destroyAllCharts() {
        for (const [canvasId, chart] of Object.entries(this.charts)) {
            if (chart) {
                chart.destroy();
            }
        }
        this.charts = {};
    }

    /**
     * Resize all charts
     */
    resizeAllCharts() {
        for (const chart of Object.values(this.charts)) {
            if (chart) {
                chart.resize();
            }
        }
    }

    /**
     * Get chart instance by canvas ID
     */
    getChart(canvasId) {
        return this.charts[canvasId];
    }

    /**
     * Export chart as image
     */
    exportChart(canvasId, filename = 'chart.png') {
        const chart = this.charts[canvasId];
        if (!chart) return null;

        const canvas = chart.canvas;
        const url = canvas.toDataURL('image/png');
        
        // Create download link
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        
        return url;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartManager;
} else {
    window.ChartManager = ChartManager;
}