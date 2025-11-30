"use client";

import React, { useEffect, useRef } from 'react';

export function BackgroundEffects() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // --- 1. Unicorn Studio Script Loader ---
    useEffect(() => {
        const loadUnicornScript = () => {
            const existingScript = document.getElementById('unicorn-studio-script');
            if (existingScript) return;

            const script = document.createElement('script');
            script.id = 'unicorn-studio-script';
            script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js";
            script.async = true;
            script.onload = () => {
                // @ts-ignore
                if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
                    // @ts-ignore
                    UnicornStudio.init();
                    // @ts-ignore
                    window.UnicornStudio.isInitialized = true;
                }
            };
            document.body.appendChild(script);
        };

        loadUnicornScript();
    }, []);

    // --- 2. Dust Particle System ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width: number, height: number;
        let particles: Array<{ x: number, y: number, size: number, speed: number, opacity: number, drift: number }> = [];
        let animationFrameId: number;

        const init = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            createParticles();
        };

        const createParticles = () => {
            particles = [];
            const count = Math.floor((width * height) / 12000);
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 1.5 + 0.1,
                    speed: Math.random() * 0.3 + 0.05,
                    opacity: Math.random() * 0.5 + 0.1,
                    drift: (Math.random() - 0.5) * 0.2
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.y -= p.speed;
                p.x += p.drift;

                // Reset if out of bounds
                if (p.y < -5) {
                    p.y = height + 5;
                    p.x = Math.random() * width;
                }
                if (p.x > width) p.x = 0;
                if (p.x < 0) p.x = width;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(16, 185, 129, ' + p.opacity + ')';
                ctx.fill();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', init);
        init();
        animate();

        return () => {
            window.removeEventListener('resize', init);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full -z-20 overflow-hidden bg-black pointer-events-none">
            {/* Unicorn Studio Aura Effect Wrapper */}
            <div className="aura-background-component absolute inset-0 w-full h-full opacity-40">
                <div data-us-project="uFY4IYPs2LU8fWm96Im2" className="absolute w-full h-full left-0 top-0"></div>
            </div>
            {/* Emerald Tint */}
            <div className="absolute inset-0 bg-emerald-950/20 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>

            {/* Dust Particle Layer */}
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none">
                <canvas ref={canvasRef} id="knowledge-dust" className="w-full h-full"></canvas>
            </div>
        </div>
    );
}
