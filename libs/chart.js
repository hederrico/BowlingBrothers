/**
 * Chart.js Mock for Demonstration
 * This is a simplified mock implementation to demonstrate the chart functionality
 * when the full Chart.js library is not available.
 */

// Create a mock Chart object if Chart is not already defined
if (typeof Chart === 'undefined') {
    window.Chart = class MockChart {
        constructor(ctx, config) {
            this.ctx = ctx;
            this.config = config;
            this.canvas = ctx.canvas || ctx;
            
            // Store reference for destruction
            const canvasId = this.canvas.id;
            if (canvasId) {
                MockChart.instances = MockChart.instances || {};
                MockChart.instances[canvasId] = this;
            }
            
            // Create a visual representation
            this.render();
        }
        
        render() {
            const canvas = this.canvas;
            const ctx = canvas.getContext('2d');
            const config = this.config;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Set canvas size
            canvas.width = canvas.offsetWidth || 400;
            canvas.height = canvas.offsetHeight || 200;
            
            // Draw based on chart type
            if (config.type === 'bar') {
                this.drawBarChart(ctx, config);
            } else if (config.type === 'line') {
                this.drawLineChart(ctx, config);
            } else if (config.type === 'doughnut') {
                this.drawDoughnutChart(ctx, config);
            } else {
                this.drawPlaceholder(ctx, config);
            }
        }
        
        drawBarChart(ctx, config) {
            const data = config.data;
            if (!data || !data.datasets || !data.datasets[0]) return;
            
            const dataset = data.datasets[0];
            const values = dataset.data;
            const labels = data.labels;
            
            const padding = 40;
            const chartWidth = ctx.canvas.width - padding * 2;
            const chartHeight = ctx.canvas.height - padding * 2;
            const barWidth = chartWidth / values.length * 0.8;
            const maxValue = Math.max(...values, 1);
            
            // Draw title
            ctx.fillStyle = '#f0f6fc';
            ctx.font = 'bold 16px Lexend';
            ctx.textAlign = 'center';
            const title = config.plugins?.title?.text || 'Histograma';
            ctx.fillText(title, ctx.canvas.width / 2, 25);
            
            // Draw bars
            values.forEach((value, index) => {
                const barHeight = (value / maxValue) * chartHeight;
                const x = padding + index * (chartWidth / values.length) + (chartWidth / values.length - barWidth) / 2;
                const y = padding + chartHeight - barHeight;
                
                // Get color from dataset
                const colors = dataset.backgroundColor;
                const color = Array.isArray(colors) ? colors[index] : colors;
                ctx.fillStyle = color || '#58a6ff';
                
                ctx.fillRect(x, y, barWidth, barHeight);
                
                // Draw value on top of bar
                ctx.fillStyle = '#f0f6fc';
                ctx.font = '12px JetBrains Mono';
                ctx.textAlign = 'center';
                if (value > 0) {
                    ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
                }
                
                // Draw label
                if (labels && labels[index]) {
                    ctx.fillStyle = '#8b949e';
                    ctx.font = '10px Lexend';
                    ctx.save();
                    ctx.translate(x + barWidth / 2, padding + chartHeight + 15);
                    ctx.fillText(labels[index], 0, 0);
                    ctx.restore();
                }
            });
        }
        
        drawLineChart(ctx, config) {
            const data = config.data;
            if (!data || !data.datasets || !data.datasets[0]) return;
            
            const dataset = data.datasets[0];
            const values = dataset.data;
            const labels = data.labels;
            
            const padding = 40;
            const chartWidth = ctx.canvas.width - padding * 2;
            const chartHeight = ctx.canvas.height - padding * 2;
            const maxValue = Math.max(...values, 1);
            const minValue = Math.min(...values, 0);
            const valueRange = maxValue - minValue || 1;
            
            // Draw title
            ctx.fillStyle = '#f0f6fc';
            ctx.font = 'bold 16px Lexend';
            ctx.textAlign = 'center';
            const title = config.plugins?.title?.text || 'Evolução';
            ctx.fillText(title, ctx.canvas.width / 2, 25);
            
            // Draw line
            ctx.strokeStyle = dataset.borderColor || '#58a6ff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            values.forEach((value, index) => {
                const x = padding + (index / (values.length - 1)) * chartWidth;
                const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw points
            ctx.fillStyle = dataset.borderColor || '#58a6ff';
            values.forEach((value, index) => {
                const x = padding + (index / (values.length - 1)) * chartWidth;
                const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
                
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
                
                // Draw value
                ctx.fillStyle = '#f0f6fc';
                ctx.font = '12px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText(value.toString(), x, y - 10);
            });
        }
        
        drawDoughnutChart(ctx, config) {
            const data = config.data;
            if (!data || !data.datasets || !data.datasets[0]) return;
            
            const dataset = data.datasets[0];
            const values = dataset.data;
            const labels = data.labels;
            const colors = dataset.backgroundColor;
            
            const centerX = ctx.canvas.width / 2;
            const centerY = ctx.canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 60;
            const total = values.reduce((sum, val) => sum + val, 0);
            
            // Draw title
            ctx.fillStyle = '#f0f6fc';
            ctx.font = 'bold 16px Lexend';
            ctx.textAlign = 'center';
            const title = config.plugins?.title?.text || 'Distribuição';
            ctx.fillText(title, centerX, 25);
            
            let currentAngle = -Math.PI / 2;
            
            values.forEach((value, index) => {
                if (value > 0) {
                    const sliceAngle = (value / total) * 2 * Math.PI;
                    
                    // Draw slice
                    ctx.fillStyle = Array.isArray(colors) ? colors[index] : colors;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                    ctx.arc(centerX, centerY, radius * 0.6, currentAngle + sliceAngle, currentAngle, true);
                    ctx.closePath();
                    ctx.fill();
                    
                    currentAngle += sliceAngle;
                }
            });
            
            // Draw legend
            const legendY = centerY + radius + 30;
            const legendItemWidth = 120;
            const startX = centerX - (labels.length * legendItemWidth) / 2;
            
            labels.forEach((label, index) => {
                const x = startX + index * legendItemWidth;
                
                // Color box
                ctx.fillStyle = Array.isArray(colors) ? colors[index] : colors;
                ctx.fillRect(x, legendY, 12, 12);
                
                // Label text
                ctx.fillStyle = '#f0f6fc';
                ctx.font = '12px Lexend';
                ctx.textAlign = 'left';
                ctx.fillText(`${label}: ${values[index]}`, x + 18, legendY + 10);
            });
        }
        
        drawPlaceholder(ctx, config) {
            // Draw a simple placeholder
            ctx.fillStyle = '#21262d';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            ctx.fillStyle = '#8b949e';
            ctx.font = '16px Lexend';
            ctx.textAlign = 'center';
            ctx.fillText('Chart Preview', ctx.canvas.width / 2, ctx.canvas.height / 2 - 10);
            ctx.fillText(`Type: ${config.type}`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 10);
        }
        
        destroy() {
            // Clear canvas
            if (this.canvas) {
                const ctx = this.canvas.getContext('2d');
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
        
        resize() {
            this.render();
        }
        
        update() {
            this.render();
        }
    };
    
    // Add static methods that might be expected
    Chart.register = function() {};
    Chart.defaults = {};
    
    console.log('Chart.js Mock loaded for demonstration');
}