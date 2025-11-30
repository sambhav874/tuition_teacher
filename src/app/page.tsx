'use client'
import React, { useEffect, useRef } from 'react';
import {
  Sparkles,
  FunctionSquare,
  Book,
  Search,
  ChevronDown,
  Award,
  Globe2,
  ShieldCheck,
  MessageSquare,
  Mic,
  PenTool,
  BookOpen
} from 'lucide-react';
import { BackgroundEffects } from '@/components/layout/BackgroundEffects';

const TuitionTeacher: React.FC = () => {
  const heroTextRef = useRef<HTMLHeadingElement>(null);

  // --- Parallax & Blur Effect ---
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const heroText = heroTextRef.current;

      if (scrolled < 600 && heroText) {
        heroText.style.transform = `translateY(${scrolled * 0.2}px)`;
        heroText.style.opacity = String(1 - (scrolled * 0.0025));
        heroText.style.filter = `blur(${scrolled * 0.04}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="antialiased overflow-x-hidden bg-transparent text-[#e5e5e5] cursor-default font-sans min-h-screen relative">
      <BackgroundEffects />

      {/* --- Navigation --- */}
      {/* --- Navigation --- */}
      <nav className="fixed top-0 left-0 w-full z-50 px-4 py-6 md:px-6 md:py-8 flex justify-between items-start mix-blend-screen pointer-events-none">
        <div className="pointer-events-auto group cursor-pointer">
          <div className="text-[10px] sm:text-xs tracking-[0.4em] font-mono text-emerald-500/80 uppercase mb-1 group-hover:text-emerald-400 transition-colors">
            Tuition
          </div>
          <div className="text-[10px] sm:text-xs tracking-[0.4em] font-mono text-emerald-500/50 uppercase group-hover:text-emerald-400 transition-colors">
            Teacher
          </div>
        </div>
        <div className="pointer-events-auto flex gap-4 sm:gap-8">
          <a href="#subjects" className="text-[8px] sm:text-[10px] font-sans text-emerald-500/40 hover:text-emerald-400 transition-colors tracking-widest uppercase">
            Curriculum
          </a>
          <a href="/chat" className="text-[8px] sm:text-[10px] font-sans text-emerald-500/40 hover:text-emerald-400 transition-colors tracking-widest uppercase">
            Chat
          </a>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center z-10 px-6">

        <div className="text-center z-10 space-y-6 md:space-y-8 max-w-4xl px-4">
          <h1 ref={heroTextRef} className="font-sans text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-emerald-100 via-emerald-600 to-emerald-950">
            Illuminating
            <br />
            <span className="font-garamond italic font-normal text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl text-emerald-400 biolum-text">
              Potential
            </span>
          </h1>
          <p className="font-mono text-emerald-500/40 text-[10px] sm:text-xs md:text-sm lg:text-base tracking-[0.2em] uppercase max-w-xs sm:max-w-lg mx-auto leading-loose">
            Connecting minds with masters <br className="hidden md:block" /> across the academic abyss.
          </p>
        </div>

        <div className="absolute bottom-12 w-full flex flex-col items-center justify-center gap-4">
          <span className="text-[10px] font-mono text-emerald-900 animate-pulse">SCROLL TO LEARN</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-emerald-800 to-transparent"></div>
        </div>
      </section>

      {/* --- Philosophy --- */}
      <section className="relative w-full py-20 md:py-32 lg:py-48 px-6 z-10 flex justify-center bg-gradient-to-b from-transparent to-[#010303]">
        <div className="max-w-2xl text-center space-y-8 md:space-y-12">
          <div className="flex justify-center">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-emerald-500/30" />
          </div>

          <p className="font-garamond text-xl sm:text-2xl md:text-3xl lg:text-4xl text-emerald-100/70 leading-relaxed font-light">
            True understanding is not surface level. It requires diving deep into the concepts that shape our reality.
          </p>

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-900/40 to-transparent"></div>

          <p className="font-garamond text-lg sm:text-xl md:text-2xl lg:text-3xl text-emerald-500/50 leading-relaxed italic">
            We curate mentors who guide you through the complexities of mathematics, science, and language with the clarity of light in deep water.
          </p>
        </div>
      </section>

      {/* --- The Curriculum Artifact --- */}
      <section id="subjects" className="relative w-full py-16 md:py-24 z-10">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-8">
          <div className="mb-8 md:mb-12 text-center">
            <h2 className="font-garamond text-3xl sm:text-4xl md:text-5xl text-emerald-100/90 italic">The Syllabus</h2>
            <p className="font-mono text-[10px] sm:text-xs text-emerald-600/50 mt-2 uppercase tracking-widest">Algorithmic Matching System</p>
          </div>

          {/* "Editor" Window */}
          <div className="relative rounded-sm overflow-hidden bg-[#050c0c] border border-emerald-900/30 biolum-box group">
            {/* Tab Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#020606] border-b border-emerald-900/20">
              <div className="flex gap-4">
                <div className="flex text-[10px] font-mono items-center gap-2">
                  <FunctionSquare className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-100/60">FindTutor.tsx</span>
                </div>
                <div className="flex text-[10px] font-mono items-center gap-2 opacity-30">
                  <Book className="w-3 h-3" />
                  <span>Subject_List.json</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-900/30"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-900/30"></div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 md:p-10 overflow-x-auto bg-[#030808]/80 backdrop-blur-sm relative">
              {/* Line Numbers & Code */}
              <pre className="font-mono text-[10px] sm:text-xs md:text-sm leading-6 md:leading-7 text-emerald-100/80">
                <span className="text-emerald-900/30 select-none mr-6">01</span><span className="syntax-pink">interface</span> <span className="syntax-yellow">Tutor</span> {'{'}{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">02</span>  <span className="syntax-cyan">expertise</span>: <span className="syntax-green">'Mathematics'</span> | <span className="syntax-green">'Physics'</span> | <span className="syntax-green">'Literature'</span>;{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">03</span>  <span className="syntax-cyan">experience</span>: <span className="syntax-pink">number</span>; <span className="syntax-gray">// Years of mastery</span>{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">04</span>  <span className="syntax-cyan">methodology</span>: <span className="syntax-green">'Socratic'</span> | <span className="syntax-green">'Practical'</span>;{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">05</span>{'}'}{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">06</span>{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">07</span><span className="syntax-pink">async function</span> <span className="syntax-yellow">matchStudent</span>(<span className="syntax-cyan">goals</span>: <span className="syntax-pink">string</span>[]): <span className="syntax-pink">Promise</span>&lt;<span className="syntax-yellow">Tutor</span>&gt; {'{'}{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">08</span>  <span className="syntax-gray">// Analyzing learning patterns...</span>{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">09</span>  <span className="syntax-pink">const</span> <span className="syntax-cyan">match</span> = <span className="syntax-pink">await</span> <span className="syntax-yellow">findOptimalMentor</span>({'{'}{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">10</span>    <span className="syntax-cyan">deepLearning</span>: <span className="syntax-pink">true</span>,{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">11</span>    <span className="syntax-cyan">patience</span>: <span className="syntax-pink">Infinity</span>,{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">12</span>    <span className="syntax-cyan">availability</span>: <span className="syntax-green">'Immediate'</span>{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">13</span>  {'}'});{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">14</span>{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">15</span>  <span className="syntax-pink">return</span> <span className="syntax-cyan">match</span>;{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">16</span>{'}'}{'\n'}
                <span className="text-emerald-900/30 select-none mr-6">17</span><span className="syntax-gray">// System Ready. Initiate Search.</span>
              </pre>

              {/* Blinking cursor effect overlay */}
              <div className="absolute top-[286px] left-[260px] w-2 h-4 bg-emerald-500/50 animate-pulse hidden md:block"></div>
            </div>

            {/* Glow Reflection */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* --- Visual Gallery (Subjects) --- */}
      <section className="w-full py-0 z-10 flex flex-col md:flex-row h-auto md:h-[60vh] lg:h-[70vh] border-y border-emerald-900/20">
        {/* Panel 1: Sciences */}
        <div className="relative w-full md:w-1/3 h-[40vh] md:h-full group overflow-hidden border-b md:border-b-0 md:border-r border-emerald-900/20 bg-black">
          <div className="absolute inset-0 bg-emerald-950/60 z-10 group-hover:bg-emerald-950/40 transition-colors duration-700"></div>
          <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2670&auto=format&fit=crop" alt="Abstract Math" className="w-full h-full object-cover opacity-50 scale-100 group-hover:scale-110 transition-transform duration-[3s] grayscale mix-blend-luminosity" />
          <div className="absolute bottom-8 left-8 z-20">
            <div className="font-mono text-[10px] text-emerald-400 mb-2">01</div>
            <h3 className="font-garamond text-2xl text-white italic">Sciences</h3>
          </div>
        </div>

        {/* Panel 2: Mathematics */}
        <div className="relative w-full md:w-1/3 h-[40vh] md:h-full group overflow-hidden border-b md:border-b-0 md:border-r border-emerald-900/20 bg-black">
          <div className="absolute inset-0 bg-black/60 z-10 group-hover:bg-black/40 transition-colors duration-700"></div>
          <img src="https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2670&auto=format&fit=crop" alt="Deep Logic" className="w-full h-full object-cover opacity-40 scale-100 group-hover:scale-110 transition-transform duration-[3s] grayscale-[50%]" />
          <div className="absolute bottom-8 left-8 z-20">
            <div className="font-mono text-[10px] text-emerald-400 mb-2">02</div>
            <h3 className="font-garamond text-2xl text-white italic">Mathematics</h3>
          </div>
        </div>

        {/* Panel 3: Humanities */}
        <div className="relative w-full md:w-1/3 h-[40vh] md:h-full group overflow-hidden bg-black">
          <div className="absolute inset-0 bg-emerald-900/30 z-10 group-hover:bg-emerald-900/20 transition-colors duration-700 mix-blend-multiply"></div>
          <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2456&auto=format&fit=crop" alt="Literature" className="w-full h-full object-cover opacity-40 scale-100 group-hover:scale-110 transition-transform duration-[3s] grayscale-[20%]" />
          <div className="absolute bottom-8 left-8 z-20">
            <div className="font-mono text-[10px] text-emerald-400 mb-2">03</div>
            <h3 className="font-garamond text-2xl text-white italic">Humanities</h3>
          </div>
        </div>
      </section>

      {/* --- AI Learning Tools --- */}
      <section id="tools" className="relative w-full py-24 px-6 z-10 bg-[#020404]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="font-garamond text-3xl sm:text-4xl md:text-5xl text-emerald-100/90 italic">AI Learning Tools</h2>
            <p className="font-mono text-[10px] sm:text-xs text-emerald-600/50 mt-2 uppercase tracking-widest">Powered by Gemini 2.0 Flash</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* AI Tutor */}
            <a href="/chat" className="group relative p-8 rounded-sm bg-[#050a09] border border-emerald-900/30 hover:border-emerald-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-emerald-900/20 text-emerald-400 group-hover:scale-110 transition-transform duration-500">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-garamond text-xl text-emerald-100">AI Tutor</h3>
                <p className="font-mono text-[10px] text-emerald-500/50 leading-relaxed">
                  24/7 Homework help & concept explanation.
                </p>
              </div>
            </a>

            {/* English Tutor */}
            <a href="/english-tutor" className="group relative p-8 rounded-sm bg-[#050a09] border border-emerald-900/30 hover:border-blue-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-blue-900/20 text-blue-400 group-hover:scale-110 transition-transform duration-500">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="font-garamond text-xl text-emerald-100">English Tutor</h3>
                <p className="font-mono text-[10px] text-emerald-500/50 leading-relaxed">
                  Master pronunciation & grammar with voice.
                </p>
              </div>
            </a>

            {/* Mock Tests */}
            <a href="/mock-tests" className="group relative p-8 rounded-sm bg-[#050a09] border border-emerald-900/30 hover:border-purple-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-purple-900/20 text-purple-400 group-hover:scale-110 transition-transform duration-500">
                  <PenTool className="w-6 h-6" />
                </div>
                <h3 className="font-garamond text-xl text-emerald-100">Mock Tests</h3>
                <p className="font-mono text-[10px] text-emerald-500/50 leading-relaxed">
                  Generate & take exams on any topic.
                </p>
              </div>
            </a>

            {/* Notes Generator */}
            <a href="/notes" className="group relative p-8 rounded-sm bg-[#050a09] border border-emerald-900/30 hover:border-amber-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-amber-900/20 text-amber-400 group-hover:scale-110 transition-transform duration-500">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-garamond text-xl text-emerald-100">Notes Generator</h3>
                <p className="font-mono text-[10px] text-emerald-500/50 leading-relaxed">
                  Summarize text & create flashcards.
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>



      {/* --- Footer --- */}
      <footer className="relative py-24 px-6 text-center z-10 border-t border-emerald-900/10 bg-[#000202]">
        <div className="space-y-8">
          <div className="text-xs tracking-[0.4em] font-sans text-emerald-500/20 uppercase">
            Tuition Teacher
          </div>

          <p className="font-garamond text-lg text-emerald-500/30 italic max-w-md mx-auto">
            "Knowledge is the only light that does not cast a shadow."
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-8 mt-12">
            <a href="#" className="text-[10px] font-mono text-emerald-900 hover:text-emerald-500 transition-colors uppercase tracking-widest">
              Tutors
            </a>
            <a href="#" className="text-[10px] font-mono text-emerald-900 hover:text-emerald-500 transition-colors uppercase tracking-widest">
              Subjects
            </a>
            <a href="#" className="text-[10px] font-mono text-emerald-900 hover:text-emerald-500 transition-colors uppercase tracking-widest">
              Login
            </a>
          </div>

          <div className="mt-16 text-[10px] font-sans text-emerald-900/40 uppercase tracking-widest">
            © 2024 Tuition Teacher Platform
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TuitionTeacher;