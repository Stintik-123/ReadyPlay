// === DNA HELIX ANIMATION ===
class DNAAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.time = 0;
        this.amplitude = 35;
        this.period = 100;
        this.strands = 2;
        this.points = 12;
        this.running = false;
    }

    start() {
        this.running = true;
        this.animate();
    }

    stop() {
        this.running = false;
    }

    getPointY(i, total) {
        return (i / (total - 1)) * this.height;
    }

    getStrandX(strandIndex, y, time) {
        const phase = strandIndex * Math.PI;
        return this.centerX + Math.sin(y / this.period * Math.PI * 2 + time + phase) * this.amplitude;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        const colors = ['#ff2d55', '#ff6b8a', '#ff0033'];
        
        // Draw strands
        for (let s = 0; s < this.strands; s++) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = colors[s];
            this.ctx.lineWidth = 3;
            this.ctx.shadowColor = colors[s];
            this.ctx.shadowBlur = 15;
            
            for (let i = 0; i <= this.points; i++) {
                const y = this.getPointY(i, this.points);
                const x = this.getStrandX(s, y, this.time);
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }

        // Draw connections (base pairs)
        for (let i = 0; i < this.points; i++) {
            const y = this.getPointY(i, this.points);
            const x1 = this.getStrandX(0, y, this.time);
            const x2 = this.getStrandX(1, y, this.time);
            
            const gradient = this.ctx.createLinearGradient(x1, y, x2, y);
            gradient.addColorStop(0, 'rgba(255, 45, 85, 0.4)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 107, 138, 0.4)');
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y);
            this.ctx.lineTo(x2, y);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
            
            // Draw nodes
            [x1, x2].forEach((x, idx) => {
                this.ctx.beginPath();
                this.ctx.arc(x, y, 4, 0, Math.PI * 2);
                this.ctx.fillStyle = idx === 0 ? '#ff2d55' : '#ff6b8a';
                this.ctx.fill();
                this.ctx.shadowColor = idx === 0 ? '#ff2d55' : '#ff6b8a';
                this.ctx.shadowBlur = 10;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            });
        }

        // Center glow
        const centerGlow = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 40
        );
        centerGlow.addColorStop(0, 'rgba(255, 45, 85, 0.3)');
        centerGlow.addColorStop(1, 'rgba(255, 45, 85, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 40, 0, Math.PI * 2);
        this.ctx.fillStyle = centerGlow;
        this.ctx.fill();
    }

    animate() {
        if (!this.running) return;
        
        this.time += 0.03;
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// === BADGE DNA ANIMATION ===
class BadgeDNAAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.time = 0;
        this.amplitude = 20;
        this.period = 60;
        this.running = false;
    }

    start() {
        this.running = true;
        this.animate();
    }

    stop() {
        this.running = false;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw hexagon border
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = this.centerX + Math.cos(angle) * 45;
            const y = this.centerY + Math.sin(angle) * 45;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.strokeStyle = 'rgba(255, 45, 85, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw mini DNA
        for (let s = 0; s < 2; s++) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = s === 0 ? '#ff2d55' : '#ff6b8a';
            this.ctx.lineWidth = 2;
            
            for (let i = 0; i <= 8; i++) {
                const y = 20 + (i / 8) * 80;
                const phase = s * Math.PI;
                const x = this.centerX + Math.sin(y / this.period * Math.PI * 2 + this.time + phase) * this.amplitude;
                
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            
            this.ctx.stroke();
        }
    }

    animate() {
        if (!this.running) return;
        
        this.time += 0.04;
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize on load
let mainDNA, badgeDNA;

document.addEventListener('DOMContentLoaded', () => {
    mainDNA = new DNAAnimation('dna-canvas');
    mainDNA.start();
    
    badgeDNA = new BadgeDNAAnimation('badge-canvas');
});
