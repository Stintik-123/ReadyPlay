// === PARTICLE SYSTEM ===
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = -1000;
        this.mouseY = -1000;
        this.isMoving = false;
        this.moveTimeout = null;
        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    init() {
        this.particles = [];
        const count = Math.min(Math.floor(window.innerWidth / 10), 120);
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.01,
                connections: []
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });

        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.isMoving = true;
            clearTimeout(this.moveTimeout);
            this.moveTimeout = setTimeout(() => {
                this.isMoving = false;
            }, 2000);
        });

        document.addEventListener('mouseleave', () => {
            this.isMoving = false;
        });
    }

    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        const gradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 3
        );
        
        gradient.addColorStop(0, `rgba(255, 45, 85, ${particle.opacity})`);
        gradient.addColorStop(0.5, `rgba(255, 107, 138, ${particle.opacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(255, 45, 85, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    drawConnections() {
        const maxDist = this.isMoving ? 180 : 130;
        const mouseMaxDist = 200;

        for (let i = 0; i < this.particles.length; i++) {
            // Connections to nearby particles
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const opacity = (1 - dist / maxDist) * 0.25;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(255, 45, 85, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }

            // Connection to mouse
            const mdx = this.particles[i].x - this.mouseX;
            const mdy = this.particles[i].y - this.mouseY;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mdist < mouseMaxDist && this.isMoving) {
                const opacity = (1 - mdist / mouseMaxDist) * 0.6;
                this.ctx.beginPath();
                this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                this.ctx.lineTo(this.mouseX, this.mouseY);
                this.ctx.strokeStyle = `rgba(255, 107, 138, ${opacity})`;
                this.ctx.lineWidth = 0.8;
                this.ctx.stroke();
                
                // Attract particles to mouse slightly
                this.particles[i].x += mdx * 0.001;
                this.particles[i].y += mdy * 0.001;
            }
        }
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Natural movement
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.pulse += particle.pulseSpeed;
            
            // Floating effect
            const floatX = Math.sin(particle.pulse) * 0.3;
            const floatY = Math.cos(particle.pulse * 1.3) * 0.3;
            particle.x += floatX;
            particle.y += floatY;

            // Wrap around edges
            if (particle.x < -50) particle.x = this.canvas.width + 50;
            if (particle.x > this.canvas.width + 50) particle.x = -50;
            if (particle.y < -50) particle.y = this.canvas.height + 50;
            if (particle.y > this.canvas.height + 50) particle.y = -50;

            // Pulsing opacity
            particle.opacity = 0.3 + Math.sin(particle.pulse) * 0.2;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateParticles();
        this.drawConnections();
        
        this.particles.forEach(particle => {
            this.drawParticle(particle);
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});
