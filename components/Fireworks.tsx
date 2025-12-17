import React, { useEffect, useRef } from 'react';

const Fireworks: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const fireworks: Firework[] = [];
    const particles: Particle[] = [];

    // Helper functions
    const random = (min: number, max: number) => Math.random() * (max - min) + min;
    
    // Classes
    class Firework {
      x: number;
      y: number;
      sx: number;
      sy: number;
      tx: number; // target x
      ty: number; // target y
      distanceToTarget: number;
      distanceTraveled: number = 0;
      coordinates: [number, number][] = [];
      coordinateCount: number = 3;
      angle: number;
      speed: number = 2;
      acceleration: number = 1.05;
      brightness: number;
      hue: number;

      constructor(sx: number, sy: number, tx: number, ty: number, hue: number) {
        this.x = sx;
        this.y = sy;
        this.sx = sx;
        this.sy = sy;
        this.tx = tx;
        this.ty = ty;
        this.hue = hue;
        this.brightness = random(50, 70);

        this.distanceToTarget = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
        this.angle = Math.atan2(ty - sy, tx - sx);

        while (this.coordinateCount--) {
          this.coordinates.push([this.x, this.y]);
        }
      }

      update(index: number) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.speed *= this.acceleration;
        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;

        this.distanceTraveled = Math.sqrt(Math.pow(this.sx - this.x, 2) + Math.pow(this.sy - this.y, 2));

        if (this.distanceTraveled >= this.distanceToTarget) {
          createParticles(this.tx, this.ty, this.hue);
          fireworks.splice(index, 1);
        } else {
          this.x += vx;
          this.y += vy;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        ctx.stroke();
      }
    }

    class Particle {
      x: number;
      y: number;
      coordinates: [number, number][] = [];
      coordinateCount: number = 5;
      angle: number;
      speed: number;
      friction: number = 0.95;
      gravity: number = 1;
      hue: number;
      brightness: number;
      alpha: number = 1;
      decay: number;

      constructor(x: number, y: number, hue: number) {
        this.x = x;
        this.y = y;
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
          this.coordinates.push([this.x, this.y]);
        }
        
        // Add variation to hue for better visuals
        this.hue = random(hue - 20, hue + 20);
        this.angle = random(0, Math.PI * 2);
        this.speed = random(1, 15); // Faster particles for bigger explosion
        this.friction = 0.95;
        this.gravity = 1;
        this.brightness = random(50, 80);
        this.alpha = 1;
        this.decay = random(0.005, 0.02); // Slower decay for longer life
      }

      update(index: number) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;

        if (this.alpha <= this.decay) {
          particles.splice(index, 1);
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        ctx.stroke();
      }
    }

    function createParticles(x: number, y: number, hue: number) {
      // Significantly increased particle count for denser fireworks
      let particleCount = 150;
      while (particleCount--) {
        particles.push(new Particle(x, y, hue));
      }
    }

    let hue = 120;
    let timerTotal = 30; // Reduced default timer for faster frequency
    let timerTick = 0;

    const loop = () => {
      if (!ctx) return;
      
      // Use lower opacity for 'destination-out' to create longer trails
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      hue += 0.5;

      let i = fireworks.length;
      while (i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
      }

      let j = particles.length;
      while (j--) {
        particles[j].draw();
        particles[j].update(j);
      }

      if (timerTick >= timerTotal) {
        // Launch from random x position at the bottom
        const startX = random(0, width);
        // Target random position in the upper half of the screen
        const targetX = random(0, width);
        const targetY = random(0, height / 2);
        
        fireworks.push(new Firework(startX, height, targetX, targetY, hue));
        
        // Randomize the next launch interval for natural feel
        timerTotal = random(15, 40); 
        timerTick = 0;
      } else {
        timerTick++;
      }

      requestAnimationFrame(loop);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    const animationId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Increased opacity for the container so fireworks are more visible
  return <canvas ref={canvasRef} className="block w-full h-full opacity-80" />;
};

export default Fireworks;