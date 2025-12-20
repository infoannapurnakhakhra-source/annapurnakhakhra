"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Heart, Users, Sparkles, Wheat, TrendingUp, CheckCircle, Home, Award } from 'lucide-react';

const Counter = ({ end, label, suffix, visible = true, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      let current = Math.floor(progress * end);
      setCount(current);
    }, 16);

    const timeout = setTimeout(() => {
      clearInterval(timer);
      setCount(end);
      setHasAnimated(true);
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [end, label, duration, visible]);

  const getFormatted = (value) => (label.includes('Customers') ? value.toLocaleString() : value);
  const displayValue = hasAnimated ? getFormatted(end) : getFormatted(count);
  const isAnimating = visible && !hasAnimated;

  return (
    <div className="text-center relative">
      <h3 className="text-4xl md:text-5xl font-bold mb-2">
        {displayValue}
        {suffix}
      </h3>
      <p className="text-lg font-medium">{label}</p>
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-ping opacity-75"></div>
        </div>
      )}
    </div>
  );
};

export default function KhakhraAboutUs() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  const values = [
    { icon: Wheat, title: "Purity", description: "We use only the finest and freshest ingredients. No preservatives, no compromises." },
    { icon: Heart, title: "Tradition", description: "Made with grandmother's recipes and traditional methods passed down through generations." },
    { icon: Sparkles, title: "Quality", description: "Every khakhra is crafted with the highest standards of quality and hygiene." },
    { icon: Users, title: "Trust", description: "Our customer's trust is our greatest asset and drives everything we do." }
  ];

  const stats = [
    { end: 5, label: "Years of Experience", suffix: "+" },
    { end: 20, label: "Varieties", suffix: "+" },
    { end: 10000, label: "Happy Customers", suffix: "+" },
    { end: 100, label: "Purity Guarantee", suffix: "%" }
  ];

  const kantabaWay = [
    "Handmade in small batches",
    "Rolled with patience, not machines",
    "Slow-roasted for perfect crunch",
    "Made by skilled women from local households",
    "No preservatives, no shortcuts, no compromise"
  ];

  const whyChoose = [
    "Real ingredients from Kantaba's original recipe",
    "Hand-crushed spices for authentic flavor",
    "Traditional iron tawa roasting method",
    "Made by local women artisans",
    "Pure ghee and fresh ingredients only",
    "The warmth of Gruh Udhyog in every bite"
  ];

  const statsRef = useRef(null);
  const [isStatsVisible, setIsStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) observer.observe(statsRef.current);

    return () => {
      if (statsRef.current) observer.unobserve(statsRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-amber-50">

      {/* HEADER WITH FULL BANNER IMAGE */}
      <header className="relative w-full h-[400px] md:h-[600px] text-white overflow-hidden">
        {/* Banner Image as background */}
        <div
          className="absolute inset-0 bg-center bg-cover filter 
        brightness-75"
          style={{ backgroundImage: "url('/b5.webp')" }}
        ></div>

        {/* Gradient Overlay */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-orange-500/60 to-orange-400/40"></div> */}

        {/* Floating Lights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/3 blur-xl animate-float" style={{ animationDelay: "1s" }}></div>

        {/* Header Text */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold animate-fade-in-down">About Us</h1>
          <p className="text-xl font-body md:text-2xl mt-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            From Kantaba's Kitchen to Your Home
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Section 1: Kantaba's Story - The Beginning */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-white/20 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-10 h-10" style={{ color: '#7d4b0e' }} />
            <h2 className="text-3xl font-heading md:text-4xl font-bold relative pb-2" style={{ color: '#7d4b0e' }}>
              Annapurna Khakhra – Our Story
              <span className="absolute bottom-0 left-0 w-16 h-1 rounded-full" style={{ background: 'linear-gradient(to right, #7d4b0e, #a0682a)' }}></span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-lg font-body text-amber-600 leading-relaxed">
              <p>
                Years ago, in a small Gujarati town filled with morning prayers, soft sunlight and the familiar aroma of fresh rotis, lived a humble homemaker named <span className="font-semibold" style={{ color: '#7d4b0e' }}>Kantaba</span>.
              </p>

              <p>
                She wasn't a businesswoman. She wasn't trained in food production. She was simply a mother who believed that food made with patience and purity becomes prasadam for the family.
              </p>

              <p>
                Every morning, before the rest of the house woke up, she would knead the dough, add hand-crushed spices, and start roasting thin, crispy khakhras on her iron tawa. No shortcuts. No hurry. Just slow roasting, steady hands and silent devotion.
              </p>
            </div>

            <div className="relative rounded-2xl m-4 sm:m-8">
              <img
                src="/k8.webp"
                alt="Traditional Khakhra Making"
                className="w-[100%] h-auto object-contain rounded-xl"
              />
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6" style={{ borderLeft: '4px solid #7d4b0e' }}>
            <p className="text-lg font-body text-amber-600 italic">
              The neighbourhood would often wake up to the comforting smell drifting from her kitchen. Soon aunties, neighbours, even faraway relatives started requesting: <span className="font-semibold" style={{ color: '#7d4b0e' }}>"Kantaba, thoda khakhra banaavi aapo ne… tamara khakhra ma ek alag j swad chhe."</span>
            </p>
            <p className="mt-4 font-medium font-heading text-amber-800 text-center text-xl">
              What began as daily routine slowly became a tradition.
            </p>
          </div>
        </section>

        {/* Section 2: The Transformation - Birth of Annapurna */}
        <section className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-orange-100 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <Sparkles className="w-10 h-10" style={{ color: '#7d4b0e' }} />
            <h2 className="text-3xl md:text-4xl font-bold font-heading relative pb-2" style={{ color: '#7d4b0e' }}>
              From Kitchen to Legacy
              <span className="absolute bottom-0 left-0 w-16 h-1 rounded-full" style={{ background: 'linear-gradient(to right, #7d4b0e, #a0682a)' }}></span>
            </h2>
          </div>

          <div className="space-y-6 text-lg font-body text-amber-600 leading-relaxed max-w-4xl mx-auto">
            <p>
              But when Kantaba became older and her hands weren't as quick, her family realised something important — the world was losing the taste of real gruh udhyog. That pure, handmade goodness you can't find in machines, factories or automated kitchens.
            </p>

            <p>
              So in her honour, and with her blessings, the family decided to turn her simple kitchen craft into a brand that stands for everything she believed in.
            </p>

            <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-8 my-8 text-center shadow-lg transform hover:scale-105 transition-transform duration-300" style={{ border: '2px solid #7d4b0e' }}>
              <Wheat className="w-16 h-16 mx-auto mb-4" style={{ color: '#7d4b0e' }} />
              <p className="font-bold font-heading text-3xl mb-3" style={{ color: '#7d4b0e' }}>
                And that's how Annapurna Khakhra was born
              </p>
              <p className="text-amber-600 italic text-lg font-body">
                A small initiative inspired by a mother's love, handmade skills, and the belief that food cooked with purity always reaches hearts, not just homes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-shadow">
                <Heart className="w-12 h-12 text-[#7d4b0e] mx-auto mb-3" />
                <h3 className="font-bold font-heading mb-2" style={{ color: '#7d4b0e' }}>Mother's Love</h3>
                <p className="text-amber-600 text-sm font-body">Every khakhra made with the same care Kantaba gave</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-shadow">
                <Users className="w-12 h-12 text-[#7d4b0e] mx-auto mb-3" />
                <h3 className="font-bold font-heading mb-2" style={{ color: '#7d4b0e' }}>Handmade Skills</h3>
                <p className="text-amber-600 text-sm font-body">Crafted by skilled local women artisans</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-shadow">
                <Sparkles className="w-12 h-12 text-[#7d4b0e] mx-auto mb-3" />
                <h3 className="font-bold font-heading mb-2" style={{ color: '#7d4b0e' }}>Pure Devotion</h3>
                <p className="text-amber-600 text-sm font-body">Food made with patience becomes prasadam</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Kantaba's Way - Our Promise */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-white/20 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <Wheat className="w-10 h-10" style={{ color: '#7d4b0e' }} />
            <h2 className="text-3xl md:text-4xl font-bold font-heading relative pb-2" style={{ color: '#7d4b0e' }}>
              Kantaba's Way - Still Alive Today
              <span className="absolute bottom-0 left-0 w-16 h-1 rounded-full" style={{ background: 'linear-gradient(to right, #7d4b0e, #a0682a)' }}></span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8 shadow-md" style={{ borderLeft: '4px solid #7d4b0e' }}>
              <p className="font-semibold font-body text-amber-800 mb-6 text-xl">Today, our khakhras are still made the way Kantaba taught us:</p>
              <ul className="space-y-4">
                {kantabaWay.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                    <CheckCircle className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
                    <span className="text-amber-700 font-medium font-body">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6 flex flex-col justify-center">
              <div className="rounded-xl p-6 text-white shadow-lg" style={{ background: 'linear-gradient(to right, #7d4b0e, #a0682a)' }}>
                <p className="text-2xl font-bold mb-3 text-center">Real ingredients. Real effort. Real taste.</p>
                <p className="text-center italic">From a single kitchen to many homes, the essence remains unchanged</p>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-md" style={{ border: '2px solid #d4a574' }}>
                <p className="text-amber-700 text-lg mb-4 font-body">
                  Every pack of Annapurna Khakhra carries a piece of that original warmth… the kind that only Gruh Udhyog can offer.
                </p>
                <div className="w-16 h-1 rounded-full mx-auto" style={{ background: 'linear-gradient(to right, #7d4b0e, #a0682a)' }}></div>
              </div>

              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-6 text-center shadow-md" style={{ border: '2px solid #7d4b0e' }}>
                <p className="font-semibold text-xl text-amber-700 italic font-body">
                  Because for us, khakhra is not just a snack. It is a blessing passed from one generation to the next — crispy, aromatic and filled with love.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group text-white rounded-xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden animate-fade-in-up"
              style={{
                background: "linear-gradient(to bottom right, #7D4B0E, #A0682A)",
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <div className="relative z-10">
                <Counter end={stat.end} label={stat.label} suffix={stat.suffix} visible={isStatsVisible} />
              </div>
            </div>
          ))}
        </section>

        {/* Values Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-white/20">
          <h2 className="text-3xl font-heading md:text-4xl font-bold mb-3 text-center" style={{ color: '#7d4b0e' }}>Kantaba's Values, Our Foundation</h2>
          <p className="text-center font-body text-amber-600 mb-8 text-lg font-body">The principles that guided her kitchen still guide our business</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <article key={index} className="bg-gradient-to-br from-orange-50 to-amber-50 font-heading rounded-xl p-6 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-orange-100">
                <div className="flex justify-center mb-4" style={{ color: '#7d4b0e' }}>
                  <value.icon className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#7d4b0e' }}>{value.title}</h3>
                <p className="text-amber-700 font-body">{value.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 md:p-12 mb-12 shadow-lg border border-orange-100">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Award className="w-10 h-10" style={{ color: '#7d4b0e' }} />
            <h2 className="text-3xl font-heading md:text-4xl font-bold text-center" style={{ color: '#7d4b0e' }}>Why Choose Annapurna Khakhra?</h2>
          </div>
          <p className="text-center font-body text-amber-600 mb-8 text-lg">Experience the difference of authentic Gruh Udhyog</p>
          <ul className="max-w-3xl mx-auto space-y-4">
            {whyChoose.map((feature, index) => (
              <li key={index} className="flex items-start space-x-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <CheckCircle className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
                <span className="text-lg text-amber-700 font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Vision */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-white/20">
          <h2 className="text-3xl font-heading md:text-4xl font-bold mb-6 relative pb-4" style={{ color: '#7d4b0e' }}>
            Our Vision
            <span className="absolute bottom-0 left-0 w-16 h-1 rounded-full" style={{ background: 'linear-gradient(to right, #7d4b0e, #a0682a)' }}></span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-lg font-body text-amber-700">
                To carry forward Kantaba's legacy by bringing the authentic taste of Gujarati Gruh Udhyog to every home in India and beyond.
              </p>
              <p className="text-lg font-body text-amber-700">
                We dream of a world where traditional food-making is valued, where local women artisans are empowered, and where every family can experience the love and care that goes into handmade food.
              </p>
              <p className="text-lg font-body text-amber-700 font-medium" style={{ color: '#7d4b0e' }}>
                Because when food is made with devotion, it becomes more than nutrition — it becomes a blessing.
              </p>
            </div>
            <div className="hidden md:block relative">
              <div className="w-64 h-64 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mx-auto opacity-50 animate-pulse-slow"></div>
              <Home className="absolute inset-0 w-32 h-32 m-auto animate-bounce" style={{ color: '#7d4b0e' }} />
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="text-white py-8 px-4 text-center" style={{ background: 'linear-gradient(to right, #7d4b0e, #5a3508)' }}>
        <div className="max-w-4xl mx-auto space-y-3">
          <p className="text-lg font-body font-medium">From Kantaba's Kitchen to Your Heart</p>
          <p className="text-amber-300 font-heading font-bold text-2xl">Annapurna Khakhra — A Blessing in Every Bite</p>
          <p className="text-sm text-amber-200 font-body italic">Handmade with Love | Roasted with Patience | Served with Pride</p>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes fade-in-down { from { opacity:0; transform:translateY(-20px);} to { opacity:1; transform:translateY(0);} }
        @keyframes fade-in-up { from { opacity:0; transform:translateY(20px);} to { opacity:1; transform:translateY(0);} }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
        @keyframes pulse-slow { 0%,100%{opacity:0.5;} 50%{opacity:0.8;} }
        @keyframes spin-slow { from{transform:rotate(0);} to{transform:rotate(360deg);} }
        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
      `}</style>
    </div>
  );
}