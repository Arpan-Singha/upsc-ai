import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const motivationalMessages = [
    // 🌟 MOTIVATIONAL (Standard)
    {
        hindi: "क्या भाई IAS नहीं बनना है?",
        english: "Hey, don't you want to become an IAS officer?",
        emoji: "🎯"
    },
    {
        hindi: "सपने वो नहीं जो सोते वक्त आएं, सपने वो हैं जो सोने न दें!",
        english: "Dreams are not what you see while sleeping, they're what keep you awake!",
        emoji: "💫"
    },
    {
        hindi: "UPSC कठिन है, पर तू भी तो कम नहीं!",
        english: "UPSC is tough, but so are you!",
        emoji: "💪"
    },

    // 👨‍🏫 TEACHER MODE (Strict Reality Check)
    {
        hindi: "पूरी class select हो जाएगी, बस तुम ही reh जाओगे!",
        english: "The whole class will get selected, only you will be left behind!",
        emoji: "🏫"
    },
    {
        hindi: "तुमसे उम्मीदे लगाना ही बेकार था!",
        english: "It was useless to have expectations from you!",
        emoji: "😞"
    },
    {
        hindi: "Time pass करना है तो घर जाओ, सीट खराब मत करो!",
        english: "If you want to pass time go home, don't waste the seat!",
        emoji: "🪑"
    },
    {
        hindi: "Selection नहीं हुआ तो log क्या बोलेंगे? सोच!",
        english: "If you don't get selected, what will people say? Think!",
        emoji: "👀"
    },

    // 👪 MOM & DAD MODE (Emotional Damage)
    {
        hindi: "शर्म नहीं आती? बाप घिस-घिस के कमा रहा है और तू...",
        english: "Don't you have shame? Father is working day & night and you...",
        emoji: "😡"
    },
    {
        hindi: "बेटा, तेरे लिए मैंने अपनी नई साड़ी भी नहीं खरीदी, और तू?",
        english: "Son, I didn't even buy a new saree to save fees, and you?",
        emoji: "�"
    },
    {
        hindi: "मेरी मेहनत की कमाई को ऐसे बर्बाद मत कर!",
        english: "Don't waste my hard-earned money like this!",
        emoji: "💸"
    },
    {
        hindi: "रिश्तेदार ताने मारते हैं, कब तक सर झुका के सुनूँ?",
        english: "Relatives taunt us, how long should I listen with my head down?",
        emoji: "😔"
    },
    {
        hindi: "अगर IAS नहीं बने, तो घर मत आना!",
        english: "If you don't become an IAS, don't come back home!",
        emoji: "�"
    },
    {
        hindi: "Coaching की fees माँ-बाप ने दी है, वो भूल गया क्या?",
        english: "Your parents paid for coaching, have you forgotten that?",
        emoji: "�"
    },
    {
        hindi: "तेरी कामयाबी के लिए मैंने मन्नत मांगी है, उसे मत तोड़!",
        english: "I have prayed for your success, don't break my trust!",
        emoji: "🙏"
    },

    // 🔥 BRUTAL TRUTH (High Blood Pressure)
    {
        hindi: "भाग क्यों रहा है? हारने वालों में नाम लिखवाना है क्या?",
        english: "Why are you running away? Want to be counted among the losers?",
        emoji: "�"
    },
    {
        hindi: "जितने में तू distract हो रहा है, उतने में कोई AIR 1 बन रहा है!",
        english: "While you're getting distracted, someone else is becoming AIR 1!",
        emoji: "⚡"
    },
    {
        hindi: "तुम्हारी जगह लेने वाला अभी Library में पढ़ रहा है!",
        english: "The person replacing you is studying in the library right now!",
        emoji: "�"
    },
    {
        hindi: "एक साल बाद यही time याद आएगा - waste किया या utilize किया?",
        english: "One year later you'll remember this moment - wasted or utilized?",
        emoji: "🔮"
    },
    {
        hindi: "Comfort zone में रहोगे तो सरकारी नौकरी सपना ही रहेगी!",
        english: "Stay in comfort zone and government job stays a dream!",
        emoji: "🛋️"
    },
    {
        hindi: "Phone रख और किताब उठा, बस इतना कर!",
        english: "Put down the phone and pick up the book, just do it!",
        emoji: "📱❌"
    }
];

export default function MotivationalPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentMessage, setCurrentMessage] = useState(motivationalMessages[0]);
    const [hasShownRecently, setHasShownRecently] = useState(false);
    const [voices, setVoices] = useState([]);

    // Preload voices on component mount
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis?.getVoices() || [];
            setVoices(availableVoices);
        };

        loadVoices();

        // Chrome loads voices asynchronously
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

    }, []);

    useEffect(() => {
        // INSTANT trigger when mouse leaves document from ANY edge
        const handleMouseLeave = (e) => {
            if (!hasShownRecently) {
                showPopup();
            }
        };

        // Also trigger on mouseout from body for faster detection
        const handleMouseOut = (e) => {
            // Check if mouse is leaving the viewport
            if (e.clientY <= 0 || e.clientX <= 0 ||
                e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
                if (!hasShownRecently) {
                    showPopup();
                }
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseout', handleMouseOut);

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseout', handleMouseOut);
        };
    }, [hasShownRecently, isVisible]);

    // Simple Text-to-Speech function
    const speakMessage = (message) => {
        if (!('speechSynthesis' in window)) return;

        // Don't interrupt ongoing speech
        if (window.speechSynthesis.speaking) return;

        // Try to find a specific male Hindi voice (Google Hindi, Rishi, etc.)
        const hindiVoice = voices.find(v =>
            (v.name.includes('Google') && v.lang.includes('hi')) ||
            (v.name.includes('Rishi') && v.lang.includes('hi')) ||
            (v.lang.includes('hi') && v.name.includes('Male')) ||
            v.lang.includes('hi') // Fallback to any Hindi voice
        );

        let utterance;

        if (hindiVoice) {
            utterance = new SpeechSynthesisUtterance(message.hindi);
            utterance.voice = hindiVoice;
            utterance.lang = 'hi-IN';
            utterance.rate = 0.85;
        } else {
            utterance = new SpeechSynthesisUtterance(message.english);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;

            // Try to find a male English voice
            const englishVoice = voices.find(v =>
                (v.name.includes('Google') && v.lang.includes('en')) ||
                (v.name.includes('Daniel') && v.lang.includes('en')) ||
                (v.name.includes('Male') && v.lang.includes('en')) ||
                v.lang.includes('en')
            );

            if (englishVoice) {
                utterance.voice = englishVoice;
            }
        }

        // Lower pitch for more masculine/serious tone
        utterance.pitch = 0.8;
        utterance.volume = 1;

        window.speechSynthesis.speak(utterance);
    };

    const showPopup = () => {
        // Pick a random message INSTANTLY
        const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
        const selectedMessage = motivationalMessages[randomIndex];
        setCurrentMessage(selectedMessage);
        setIsVisible(true);
        setHasShownRecently(true);

        // Speak automatically - works now because audio was unlocked on first user click!
        // speakMessage(selectedMessage);

        // Auto-hide after 10 seconds
        setTimeout(() => {
            setIsVisible(false);
            // Stop speaking when popup closes
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }

            // Allow instant re-trigger for 5 seconds after popup closes
            // If user leaves again within 5 seconds, show immediately!
            setTimeout(() => {
                // After 5 second grace period, apply longer cooldown
                setHasShownRecently(true);
                setTimeout(() => {
                    setHasShownRecently(false);
                }, 15000); // 15 more seconds cooldown after the 5 second grace period
            }, 5000);

            // Allow immediate re-trigger for first 5 seconds
            setHasShownRecently(false);
        }, 10000);
    };

    // Handle speak button click - this is a user gesture so speech works!
    const handleSpeakClick = () => {
        speakMessage(currentMessage);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md">
            <div className="relative max-w-2xl mx-4 text-center popup-content">
                {/* Close button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
                >
                    <X size={28} />
                </button>

                {/* Emoji */}
                <div className="text-7xl mb-6 animate-bounce">
                    {currentMessage.emoji}
                </div>

                {/* Hindi Message */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                    {currentMessage.hindi}
                </h1>

                {/* English Translation */}
                <p className="text-lg md:text-xl text-white/70 mb-6">
                    {currentMessage.english}
                </p>

                {/* Hear Message Button - User gesture triggers speech */}
                <button
                    onClick={handleSpeakClick}
                    className="mb-4 px-6 py-2 bg-white/10 border border-white/30 text-white rounded-full hover:bg-white/20 transition-all text-sm font-medium"
                >
                    🔊 सुनो यह संदेश
                </button>

                {/* CTA Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="block mx-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                    चलो वापस पढ़ते हैं! 📖
                </button>

                {/* Motivational tagline */}
                <p className="mt-6 text-white/50 text-sm">
                    UPSC.AI believes in you! 💙
                </p>
            </div>

            <style>{`
                .popup-content {
                    animation: instantPop 0.15s ease-out;
                }
                @keyframes instantPop {
                    from { 
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
}

