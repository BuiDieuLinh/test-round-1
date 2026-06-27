(function () {
    'use strict';

    const numbersInput = document.getElementById("numbers");
    const drawBtn = document.getElementById("drawBtn");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const errorBanner = document.getElementById("message");
    const resultDisplay = document.getElementById("result");

    window.addEventListener("load", () => {
        setupCanvas();
        draw();
    });
    window.addEventListener("resize", () => {
        setupCanvas();
        draw();
    });

    drawBtn.addEventListener("click", draw);

    numbersInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            draw();
        }
    });

    function setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentNode.getBoundingClientRect();
        
        const displayWidth = Math.max(rect.width, 320);
        const displayHeight = 365;

        canvas.style.width = displayWidth + "px";
        canvas.style.height = displayHeight + "px";
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }

    function draw() {
        clearError();

        const inputVal = numbersInput.value.trim();
        if (inputVal === "") {
            showError("Vui lòng nhập dữ liệu độ cao.");
            return;
        }

        const tokens = inputVal.split(",");
        const heights = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i].trim();
            if (token === "") {
                showError("Định dạng dữ liệu không hợp lệ. Vui lòng xóa dấu phẩy thừa hoặc liền nhau.");
                return;
            }

            const num = Number(token);
            if (Number.isNaN(num) || num < 0 || !Number.isInteger(num)) {
                showError(`Giá trị không hợp lệ '${token}' tại vị trí ${i + 1}. Chỉ cho phép các số nguyên không âm.`);
                return;
            }
            heights.push(num);
        }

        if (heights.length === 0) {
            showError("Vui lòng cung cấp một chuỗi các độ cao hợp lệ.");
            return;
        }

        const analysis = WaterCalculator.analyze(heights);
        const visualizer = new WaterVisualizer(canvas, ctx);
        visualizer.render(heights, analysis);

        resultDisplay.textContent = `${analysis.totalWater} m³`;
    }

    function showError(text) {
        errorBanner.textContent = text;
        errorBanner.className = "message-banner error";
    }

    function clearError() {
        errorBanner.textContent = "";
        errorBanner.className = "message-banner";
    }

    const WaterCalculator = {
        /**
         * Solves the Trapping Rain Water problem
         * Computes boundaries in O(n) space and time
         * @param {number[]} heights
         * @returns {{totalWater: number, leftMax: number[], rightMax: number[]}}
         */
        analyze(heights) {
            const n = heights.length;
            if (n === 0) {
                return { totalWater: 0, leftMax: [], rightMax: [] };
            }

            const leftMax = new Array(n);
            const rightMax = new Array(n);

            leftMax[0] = heights[0];
            for (let i = 1; i < n; i++) {
                leftMax[i] = Math.max(leftMax[i - 1], heights[i]);
            }

            rightMax[n - 1] = heights[n - 1];
            for (let i = n - 2; i >= 0; i--) {
                rightMax[i] = Math.max(rightMax[i + 1], heights[i]);
            }

            let totalWater = 0;
            for (let i = 0; i < n; i++) {
                const boundary = Math.min(leftMax[i], rightMax[i]);
                totalWater += Math.max(0, boundary - heights[i]);
            }

            return {
                totalWater,
                leftMax,
                rightMax
            };
        }
    };

    class WaterVisualizer {
        constructor(canvas, context) {
            this.canvas = canvas;
            this.ctx = context;
        }

        /**
         * Renders the grids, bars, and water levels dynamically based on heights
         * @param {number[]} heights 
         * @param {Object} analysis 
         */
        render(heights, analysis) {
            const width = parseFloat(this.canvas.style.width);
            const height = parseFloat(this.canvas.style.height);

            const paddingLeft = 50;
            const paddingRight = 40;
            const paddingTop = 40;
            const paddingBottom = 40;

            const plotWidth = width - paddingLeft - paddingRight;
            const plotHeight = height - paddingTop - paddingBottom;
            const baseLineY = height - paddingBottom;

            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillRect(0, 0, width, height);

            const numBlocks = heights.length;
            const maxVal = Math.max(...heights, 1);
            
            const colWidthTotal = plotWidth / numBlocks;
            const colGap = Math.max(2, colWidthTotal * 0.08);
            const colWidth = colWidthTotal - colGap;

            const scaleY = plotHeight / (maxVal + 0.5);

            this.drawGrid(paddingLeft, baseLineY, plotWidth, maxVal, scaleY);
            for (let i = 0; i < numBlocks; i++) {
                const x = paddingLeft + (i * colWidthTotal) + (colGap / 2);
                const limit = Math.min(analysis.leftMax[i], analysis.rightMax[i]);
                
                for (let j = 0; j < heights[i]; j++) {
                    const blockY = baseLineY - (j + 1) * scaleY;
                    this.drawLandBlock(x, blockY, colWidth, scaleY);
                }

                for (let j = heights[i]; j < limit; j++) {
                    const blockY = baseLineY - (j + 1) * scaleY;
                    this.drawWaterBlock(x, blockY, colWidth, scaleY);
                }
                this.drawLabel(i.toString(), x + colWidth / 2, baseLineY + 12, "11px var(--font-sans)", "var(--text-muted)");
            }

            this.ctx.strokeStyle = "#2f80e3ff";
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(paddingLeft - 10, baseLineY);
            this.ctx.lineTo(paddingLeft + plotWidth + 10, baseLineY);
            this.ctx.stroke();
        }

        drawGrid(xStart, yBase, width, maxVal, scaleY) {
            this.ctx.strokeStyle = "#f1f5f9";
            this.ctx.lineWidth = 1.2;
            this.ctx.textAlign = "right";
            this.ctx.textBaseline = "middle";
            this.ctx.fillStyle = "#64748b";
            this.ctx.font = "11px var(--font-sans)";

            const step = maxVal > 15 ? Math.ceil(maxVal / 10) : 1;
            for (let val = 0; val <= maxVal; val += step) {
                const y = yBase - (val * scaleY);

                this.ctx.beginPath();
                this.ctx.moveTo(xStart - 10, y);
                this.ctx.lineTo(xStart + width, y);
                this.ctx.stroke();

                this.ctx.fillText(`${val}m`, xStart - 15, y);
            }
        }

        drawWaterBlock(x, y, w, scaleY) {
            this.ctx.save();
            const verticalGap = Math.min(2, scaleY * 0.15);
            const drawH = scaleY - verticalGap;
            
            this.ctx.fillStyle = "rgba(87, 183, 241, 0.4)";
            
            this.ctx.beginPath();
            const radius = Math.min(2, w / 8);
            if (this.ctx.roundRect) {
                this.ctx.roundRect(x, y, w, drawH, radius);
            } else {
                this.ctx.rect(x, y, w, drawH);
            }
            this.ctx.fill();

            this.ctx.strokeStyle = "#0ea5e9";
            this.ctx.lineWidth = 1.2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + w, y);
            this.ctx.stroke();

            this.ctx.restore();
        }

        drawLandBlock(x, y, w, scaleY) {
            this.ctx.save();
            const verticalGap = Math.min(2, scaleY * 0.15);
            const drawH = scaleY - verticalGap;

            const grad = this.ctx.createLinearGradient(x, y, x, y + drawH);
            grad.addColorStop(0, "#64748b");
            grad.addColorStop(1, "#334155");

            this.ctx.fillStyle = grad;

            this.ctx.beginPath();
            const radius = Math.min(2, w / 8);
            if (this.ctx.roundRect) {
                this.ctx.roundRect(x, y, w, drawH, radius);
            } else {
                this.ctx.rect(x, y, w, drawH);
            }
            this.ctx.fill();

            this.ctx.strokeStyle = "rgba(15, 23, 42, 0.08)";
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            this.ctx.restore();
        }

        drawLabel(text, x, y, font, color) {
            this.ctx.save();
            this.ctx.font = font;
            this.ctx.fillStyle = color;
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "top";
            this.ctx.fillText(text, x, y);
            this.ctx.restore();
        }
    }

})();