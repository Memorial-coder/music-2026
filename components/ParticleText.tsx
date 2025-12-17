import React, { useEffect, useRef } from 'react';

interface ParticleTextProps {
  text: string;
}

const ParticleText: React.FC<ParticleTextProps> = ({ text }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999, radius: 80 };

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Configuration
    const particleGap = 4; // Dense particles
    const mouseForce = 100; // Force of push
    const returnSpeed = 0.1; // How fast particles return to original spot

    class Particle {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      size: number;
      color: string;
      density: number;

      constructor(x: number, y: number, color: string) {
        this.x = Math.random() * width; // Start at random position
        this.y = Math.random() * height;
        this.targetX = x;
        this.targetY = y;
        this.size = 2;
        this.color = color;
        this.density = Math.random() * 30 + 1;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Mouse interaction force
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = mouse.radius;
        const force = (maxDistance - distance) / maxDistance;
        const directionX = forceDirectionX * force * this.density;
        const directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
          // Push away from mouse
          this.x -= directionX;
          this.y -= directionY;
        } else {
          // Return to home position
          if (this.x !== this.targetX) {
            const dxHome = this.x - this.targetX;
            this.x -= dxHome * returnSpeed;
          }
          if (this.y !== this.targetY) {
            const dyHome = this.y - this.targetY;
            this.y -= dyHome * returnSpeed;
          }
        }
        
        this.draw();
      }
    }

    const init = () => {
      particles = [];
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // 1. Draw text to a virtual canvas to get pixel data
      const virtualCanvas = document.createElement('canvas');
      virtualCanvas.width = width;
      virtualCanvas.height = height;
      const vCtx = virtualCanvas.getContext('2d');
      if (!vCtx) return;

      // Responsive font size
      const fontSize = Math.min(width * 0.15, 150);
      
      vCtx.fillStyle = 'white';
      vCtx.font = `bold ${fontSize}px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif`;
      vCtx.textAlign = 'center';
      vCtx.textBaseline = 'middle';
      vCtx.fillText(text, width / 2, height / 2);

      // 2. Scan pixel data
      const imageData = vCtx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // 3. Create particles where pixels are non-transparent
      for (let y = 0; y < height; y += particleGap) {
        for (let x = 0; x < width; x += particleGap) {
          const index = (y * width + x) * 4;
          const alpha = data[index + 3];
          
          if (alpha > 128) {
            // Pick a color based on position or random
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            
            // To add some "firework" shimmer to text, we can vary colors slightly
            const isRed = Math.random() > 0.8;
            const color = isRed ? '#ff6b6b' : `rgb(${r}, ${g}, ${b})`;
            
            particles.push(new Particle(x, y, color));
          }
        }
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    // Event Listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      mouse.x = touch.clientX;
      mouse.y = touch.clientY;
    }

    const handleResize = () => {
      init();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [text]); // Re-run when text changes

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

export default ParticleText;