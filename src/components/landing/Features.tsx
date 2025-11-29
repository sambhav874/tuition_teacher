"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mic, PenTool, Brain, Calculator } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        icon: PenTool,
        title: "Visual Concepts",
        description: "AI generates custom illustrations to explain complex topics instantly.",
    },
    {
        icon: Mic,
        title: "Voice Interaction",
        description: "Speak to your tutor naturally. Listen to explanations in Hindi or English.",
    },
    {
        icon: Calculator,
        title: "Math & LaTeX",
        description: "Beautifully rendered equations for math, physics, and chemistry.",
    },
    {
        icon: Brain,
        title: "Smart Quizzes",
        description: "Test your knowledge with interactive quizzes generated just for you.",
    },
];

export function Features() {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        cardsRef.current.forEach((card, index) => {
            gsap.fromTo(
                card,
                { y: 100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                    delay: index * 0.1,
                }
            );
        });
    }, []);

    return (
        <section className="bg-black py-32 text-white">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-20 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                        Everything you need to <br />
                        <span className="text-neutral-500">excel in your studies.</span>
                    </h2>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            ref={(el) => { cardsRef.current[index] = el; }}
                            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/50 p-8 transition-colors hover:bg-neutral-900"
                        >
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white group-hover:bg-white group-hover:text-black transition-colors duration-300">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                            <p className="text-neutral-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
