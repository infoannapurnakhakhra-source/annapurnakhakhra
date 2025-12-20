"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Custom debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// Sub-component: AI Avatar
const AIAvatar = ({ isSpeaking, theme, onStopSpeech }) => {
    const themeColors = {
        light: { glow: 'from-indigo-500/20 to-pink-500/20', particles: 'bg-indigo-300 bg-pink-300 bg-purple-300 bg-blue-300' },
        dark: { glow: 'from-indigo-500/20 to-pink-500/20', particles: 'bg-indigo-500 bg-pink-500 bg-purple-500 bg-blue-500' }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="flex justify-center items-stretch h-full relative z-10 min-h-[600px] pb-8" role="img" aria-label="AI Assistant Avatar">
            <div className="relative w-full max-w-xl h-full group flex-1">
                <img
                    src="11.webp"
                    alt="AI Assistant Avatar - A friendly digital character ready to answer your questions"
                    className="w-full h-full object-cover rounded-3xl shadow-2xl transition-all duration-700 ease-out group-hover:scale-105 group-hover:shadow-3xl border-4 border-white/30 hover:border-gradient-to-r hover:border-indigo-200/50 animate-gentle-bob"
                />
                {isSpeaking && (
                    <div className="absolute inset-0 rounded-3xl overflow-hidden" aria-live="polite" aria-label="AI is speaking">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 animate-gradient-x"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-indigo-500/40 to-transparent animate-wave-slow"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center space-y-2">
                                <div className="flex space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-2 h-2 bg-gradient-to-t from-indigo-400 to-pink-400 rounded-full animate-bounce-smooth"
                                            style={{ animationDelay: `${i * 0.1}s` }}
                                            aria-hidden="true"
                                        />
                                    ))}
                                </div>
                                <div className="text-white text-sm font-semibold animate-pulse">Listening & Speaking</div>
                            </div>
                        </div>
                        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2" aria-hidden="true">
                            <div className="w-12 h-8 bg-white/20 rounded-b-full animate-mouth-open"></div>
                        </div>
                    </div>
                )}
                {!isSpeaking && (
                    <div
                        className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${themeColors[theme].glow} blur opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                        aria-hidden="true"
                    >
                        <div className="absolute top-4 left-4 w-1 h-1 bg-white rounded-full animate-sparkle"></div>
                        <div className="absolute bottom-8 right-8 w-1 h-1 bg-white rounded-full animate-sparkle" style={{ animationDelay: '1.5s' }}></div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-component: FAQ Item
const FAQItem = ({ faq, index, openIndex, isSpeaking, theme, onToggle, onKeyDown }) => {
    const isOpen = openIndex === index;
    const themeClasses = {
        questionBg: theme === 'light' ? 'bg-gradient-to-r from-indigo-50 to-pink-50 hover:from-indigo-100 hover:to-pink-100 text-gray-800' : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-200',
        questionText: theme === 'light' ? 'text-[#7C4A0E]' : 'text-[#7C4A0E]',
        arrowClosed: theme === 'light' ? 'text-gray-400 group-hover:text-indigo-500' : 'text-gray-500 group-hover:text-indigo-400',
        answerText: theme === 'light' ? 'text-[#7C4A0E]' : 'text-[#7C4A0E]',
        answerBg: theme === 'light' ? 'bg-gradient-to-r from-indigo-50/80 to-pink-50/80' : 'bg-gradient-to-r from-indigo-900/80 to-pink-900/80',
        cardBg: theme === 'light' ? 'bg-white/90 border-gray-200/50' : 'bg-gray-800/90 border-gray-600/50',
        hoverText: theme === 'light' ? 'group-hover:text-[#7C4A0E]' : 'group-hover:text-[#7C4A0E]'
    };

    return (
        <li>
            <div className={`group border-2 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 ease-out transform hover:-translate-y-2 ${themeClasses.cardBg} backdrop-blur-lg animate-stagger-slide-in ${index % 2 ? 'animate-delay-300' : 'animate-delay-100'}`}>
                <button
                    onClick={() => onToggle(index)}
                    onKeyDown={(e) => onKeyDown(e, index)}
                    className={`${themeClasses.questionBg} w-full px-8 py-6 text-left focus:outline-none focus:ring-4 focus:ring-indigo-200/50 transition-all duration-400 relative overflow-hidden ${isSpeaking && isOpen ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={isSpeaking && isOpen}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${index}`}
                    id={`faq-question-${index}`}
                    role="button"
                >
                    <div className="flex justify-between items-center relative z-10">
                        <h2 className={`text-2xl font-heading font-bold ${themeClasses.questionText} ${themeClasses.hoverText} transition-colors duration-300 pr-4`}>
                            {faq.question}
                        </h2>
                        <span
                            className={`text-3xl transition-all duration-700 ease-bounce ${isOpen ? 'scale-125 text-pink-600' : themeClasses.arrowClosed}`}
                            aria-hidden="true"
                        >
                            {isOpen ? '−' : '+'}
                        </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700" aria-hidden="true"></div>
                </button>
                <div
                    id={`faq-${index}`}
                    className={`overflow-hidden transition-all duration-700 ease-out ${isOpen ? `max-h-96 opacity-100 ${themeClasses.answerBg}` : 'max-h-0 opacity-0'}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    aria-hidden={!isOpen}
                >
                    <div className="px-8 pb-6 pt-4">
                        <p className={`${themeClasses.answerText} leading-relaxed text-lg animate-expand-text`}>
                            {faq.answer}
                        </p>
                    </div>
                </div>
            </div>
        </li>
    );
};

// Sub-component: No Results
const NoResults = ({ theme }) => (
    <div className="text-center py-12" role="alert">
        <p className={`${theme === 'light' ? 'text-[#7C4A0E]' : 'text-[#7C4A0E]'} text-lg animate-fade-in-up`}>No FAQs match your search. Try something else! 🔍</p>
    </div>
);

// Sub-component: Search Bar
const SearchBar = ({ searchQuery, onSearchChange, theme }) => (
    <div className="mb-8 relative">
    </div>
);

// Main Component
const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [theme, setTheme] = useState('light'); // Default fallback
    const [voices, setVoices] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Initialize theme from localStorage (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('faq-theme');
            if (savedTheme) setTheme(savedTheme);
        }
    }, []);

    // Save theme to localStorage when it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('faq-theme', theme);
        }
    }, [theme]);

    // Load voices
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    // FAQs data
    const faqs = useMemo(() => [
        {
            question: 'Are your khakhras handmade?',
            answer: 'Yes! Every khakhra is handcrafted following traditional methods.'
        },
        {
            question: 'Do you use preservatives?',
            answer: 'No. Our products are 100% natural and fresh.'
        },
        {
            question: 'How should I store khakhra?',
            answer: 'Store in a cool, dry place. Keep the pack sealed to maintain crunch.'
        },
        {
            question: 'Do you offer bulk or corporate orders?',
            answer: 'Yes. Contact us for customised pricing.'
        },
        {
            question: 'What is the shelf life?',
            answer: 'Typically 3–6 months depending on flavour and oil type.'
        },
    ], []);

    // Debounced search
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Filter FAQs based on search
    const filteredFaqs = useMemo(() => {
        if (!debouncedSearchQuery) return faqs;
        const lowerQuery = debouncedSearchQuery.toLowerCase();
        return faqs.filter(faq =>
            faq.question.toLowerCase().includes(lowerQuery) ||
            faq.answer.toLowerCase().includes(lowerQuery)
        );
    }, [faqs, debouncedSearchQuery]);

    // Memoized theme classes
    const themeClasses = useMemo(() => ({
        bgClass: theme === 'light'
            ? 'bg-gradient-to-br from-indigo-50 via-white to-pink-50'
            : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
        textClass: theme === 'light' ? 'text-gray-600' : 'text-gray-300',
        gradientTextClass: theme === 'light'
            ? 'bg-gradient-to-r from-[#7C4A0E] via-[#7C4A0E] to-[#7C4A0E]'
            : 'bg-gradient-to-r from-[#7C4A0E]/80 via-[#7C4A0E]/80 to-[#7C4A0E]/80',
        buttonClass: theme === 'light'
            ? 'bg-white/80 hover:bg-white text-gray-800'
            : 'bg-gray-800/80 hover:bg-gray-700 text-gray-200',
    }), [theme]);

    // Toggle FAQ and speak
    const toggleFAQ = useCallback((index) => {
        const newOpenIndex = openIndex === index ? null : index;
        setOpenIndex(newOpenIndex);
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        if (newOpenIndex !== null && newOpenIndex < filteredFaqs.length) {
            if ('speechSynthesis' in window) {
                try {
                    const utterance = new SpeechSynthesisUtterance(filteredFaqs[newOpenIndex].answer);
                    utterance.lang = 'en-US';
                    utterance.rate = 0.85;
                    utterance.pitch = 1.1;
                    utterance.volume = 0.8;
                    const femaleVoices = voices.filter(voice =>
                        voice.lang.startsWith('en') && (
                            voice.name.toLowerCase().includes('female') ||
                            voice.name.toLowerCase().includes('woman') ||
                            voice.name.toLowerCase().includes('samantha') ||
                            voice.name.toLowerCase().includes('zira') ||
                            voice.name.toLowerCase().includes('susan') ||
                            voice.name.toLowerCase().includes('cortana') ||
                            voice.name.toLowerCase().includes('google us english') && voice.name.toLowerCase().includes('female') ||
                            voice.name.toLowerCase().includes('microsoft zira') ||
                            voice.name.toLowerCase().includes('apple siri female')
                        )
                    );
                    const selectedVoice = femaleVoices[0] || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
                    if (selectedVoice) {
                        utterance.voice = selectedVoice;
                    }
                    utterance.onstart = () => setIsSpeaking(true);
                    utterance.onend = () => setIsSpeaking(false);
                    utterance.onerror = (event) => {
                        console.error('Speech synthesis error:', event.error);
                        setIsSpeaking(false);
                    };
                    window.speechSynthesis.speak(utterance);
                } catch (error) {
                    console.error('Speech synthesis error:', error);
                    setIsSpeaking(false);
                }
            }
        } else {
            setIsSpeaking(false);
        }
    }, [openIndex, filteredFaqs, voices]);

    // Theme toggle
    const toggleTheme = useCallback(() => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }, [theme]);

    // Keyboard handler
    const handleKeyDown = useCallback((e, index) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFAQ(index);
        } else if (e.key === 'Escape' && openIndex === index) {
            setOpenIndex(null);
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            }
        }
    }, [toggleFAQ, openIndex]);

    // Cleanup speech
    useEffect(() => {
        return () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Stop speech
    const stopSpeech = useCallback(() => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
        }
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    // Handle search change
    const handleSearchChange = useCallback((query) => {
        setSearchQuery(query);
        if (openIndex !== null) {
            setOpenIndex(null);
            if (window.speechSynthesis.speaking) {
                stopSpeech();
            }
        }
    }, [openIndex, stopSpeech]);

    return (
        <div className={` ${themeClasses.bgClass}`}>
            <div className={`max-w-7xl mx-auto py-16 px-4 min-h-screen relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20">
                    <div className={`absolute top-20 left-10 w-2 h-2 ${theme === 'light' ? 'bg-[#7C4A0E]' : 'bg-[#7C4A0E]'} rounded-full animate-ping`}></div>
                    <div className={`absolute top-40 right-20 w-3 h-3 ${theme === 'light' ? 'bg-[#7C4A0E]' : 'bg-[#7C4A0E]'} rounded-full animate-ping`} style={{ animationDelay: '1s' }}></div>
                    <div className={`absolute bottom-32 left-1/2 w-1 h-1 ${theme === 'light' ? 'bg-[#7C4A0E]' : 'bg-[#7C4A0E]'} rounded-full animate-ping`} style={{ animationDelay: '2s' }}></div>
                    <div className={`absolute bottom-20 right-10 w-2 h-2 ${theme === 'light' ? 'bg-[#7C4A0E]' : 'bg-[#7C4A0E]'} rounded-full animate-ping`} style={{ animationDelay: '0.5s' }}></div>
                </div>
                <h1 className={`text-4xl mb-5 font-heading font-extrabold text-center text-transparent bg-clip-text ${themeClasses.gradientTextClass} mb-4 animate-fade-in-down`} role="banner">
                    Frequently Asked Questions
                </h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                    <AIAvatar isSpeaking={isSpeaking} theme={theme} onStopSpeech={stopSpeech} />
                    <div className="space-y-6 h-auto" role="main">
                        <SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange} theme={theme} />
                        {filteredFaqs.length === 0 ? (
                            <NoResults theme={theme} />
                        ) : (
                            <ul className="space-y-6" role="list">
                                {filteredFaqs.map((faq, index) => (
                                    <FAQItem
                                        key={index}
                                        faq={faq}
                                        index={index}
                                        openIndex={openIndex}
                                        isSpeaking={isSpeaking}
                                        theme={theme}
                                        onToggle={toggleFAQ}
                                        onKeyDown={handleKeyDown}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <style jsx global>{`
                @keyframes gentle-bob {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes stagger-slide-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes expand-text {
                    from { opacity: 0; max-height: 0; }
                    to { opacity: 1; max-height: 200px; }
                }
                @keyframes animate-gradient-x {
                    0%, 100% { transform: translateX(-100%); }
                    50% { transform: translateX(100%); }
                }
                @keyframes animate-wave-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes animate-bounce-smooth {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes animate-mouth-open {
                    0%, 100% { height: 4px; border-radius: 50%; }
                    50% { height: 12px; border-radius: 30%; }
                }
                @keyframes animate-sparkle {
                    0%, 100% { opacity: 0; transform: scale(0); }
                    50% { opacity: 1; transform: scale(1); }
                }
                @keyframes animate-slide-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-gentle-bob { animation: gentle-bob 3s ease-in-out infinite; }
                .animate-stagger-slide-in { animation: stagger-slide-in 0.6s ease-out forwards; }
                .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
                .animate-expand-text { animation: expand-text 0.7s ease-out forwards; }
                .animate-delay-100 { animation-delay: 0.1s; }
                .animate-delay-300 { animation-delay: 0.3s; }
                .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
            `}</style>
            </div>
        </div>
    );
};

export default FAQSection;
