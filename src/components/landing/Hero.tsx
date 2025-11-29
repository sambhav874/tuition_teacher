"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const subtextRef = useRef<HTMLParagraphElement>(null);
    const buttonRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        const tl = gsap.timeline();

        tl.fromTo(
            textRef.current,
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power4.out", delay: 0.2 }
        )
            .fromTo(
                subtextRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
                "-=0.5"
            )
            .fromTo(
                buttonRef.current,
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
                "-=0.5"
            );

        // Floating animation for background elements
        gsap.to(".floating-element", {
            y: "20px",
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: 0.5,
        });
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-4 text-center"
        >
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="floating-element absolute left-[10%] top-[20%] h-20 w-20 rounded-full border border-white/10 bg-white/5 blur-xl" />
                <div className="floating-element absolute right-[15%] top-[15%] h-32 w-32 rounded-full border border-white/10 bg-white/5 blur-xl" />
                <div className="floating-element absolute bottom-[20%] left-[20%] h-24 w-24 rounded-full border border-white/10 bg-white/5 blur-xl" />
            </div>

            <div className="relative z-10 max-w-4xl space-y-8">
                <div className="flex justify-center">
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-neutral-300 backdrop-blur-md">
                        <Sparkles className="h-4 w-4 text-white" />
                        <span>AI-Powered Learning</span>
                    </div>
                </div>

                <h1
                    ref={textRef}
                    className="text-6xl font-bold tracking-tighter text-white sm:text-8xl md:text-9xl"
                >
                    Master Any <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                        Subject.
                    </span>
                </h1>

                <p
                    ref={subtextRef}
                    className="mx-auto max-w-2xl text-lg text-neutral-400 sm:text-xl"
                >
                    Your personal AI Tutor. Visual concepts, voice interaction, and personalized quizzes.
                    Strictly monochrome. Strictly focused.
                </p>

                <div className="pt-8">
                    <Link
                        ref={buttonRef}
                        href="/chat"
                        className="group relative inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-bold text-black transition-transform hover:scale-105 active:scale-95"
                    >
                        Start Learning
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
