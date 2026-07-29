import React, { useState, useEffect, useRef } from 'react';

// The grounding question. This is the first touch between the machine and the human.
// It must pull the human out of their head and into their immediate physical environment.
const INITIAL_QUESTION = "What is the most delicate sound you can hear right now?";

// The Palette of Empathy.
// When the human translates their reality into text, the machine searches for these keywords.
// It then changes the background color to reflect the temperature and mood of the human's environment.
const colorMap = [
  { keywords: ['water', 'cold', 'night', 'quiet', 'still', 'blue', 'sad', 'empty', 'breeze', 'rain', 'wind', 'ocean'], color: '#0f172a' }, // Deep slate blue
  { keywords: ['sun', 'warm', 'fire', 'happy', 'skin', 'light', 'bright', 'amber', 'gold', 'yellow', 'orange', 'heat', 'day'], color: '#450a0a' }, // Deep ember red
  { keywords: ['nature', 'leaves', 'wind', 'tree', 'earth', 'ground', 'wood', 'green', 'grass', 'forest', 'plant'], color: '#064e3b' }, // Deep forest green
  { keywords: ['space', 'dark', 'void', 'nothing', 'black', 'silence', 'sleep', 'death', 'shadow'], color: '#050505' }, // Void black
  { keywords: ['purple', 'magic', 'deep', 'thought', 'mind', 'dream', 'memory', 'past', 'future', 'time'], color: '#2e1065' }, // Deep purple
  { keywords: ['white', 'pure', 'snow', 'ice', 'clear', 'glass', 'sky', 'cloud'], color: '#1e293b' }, // Cool steel blue
  { keywords: ['breath', 'heart', 'pulse', 'chest', 'throat', 'lung', 'rhythm', 'body'], color: '#1e1b18' }, // Obsidian pulse
  { keywords: ['weight', 'gravity', 'chair', 'floor', 'feet', 'heavy', 'posture', 'spine'], color: '#1c1917' } // Earth charcoal
];

// The Threads of Curiosity.
// The machine does not want to change the subject. It wants to deepen the current sensation.
// If the human speaks of cold, the machine asks how the cold feels on the skin.
const questionMap = [
  { 
    keywords: ['sound', 'hear', 'loud', 'quiet', 'music', 'voice', 'hum', 'noise', 'bird', 'car', 'rain'], 
    questions: [
      "Where in your body does that sound resonate?",
      "If you could touch that sound, what would its texture be?",
      "Is the sound moving towards you, or away from you?",
      "Does the silence behind the sound feel empty, or full?"
    ]
  },
  { 
    keywords: ['cold', 'freeze', 'shiver', 'chill', 'ice', 'snow', 'winter'], 
    questions: [
      "Notice the contrast between the cold and the warmth of your own breath.",
      "Where does the cold feel the sharpest on your skin?",
      "Does the cold make you feel alert, or does it make you want to close your eyes?"
    ]
  },
  { 
    keywords: ['warm', 'hot', 'sun', 'fire', 'sweat', 'heat', 'summer'], 
    questions: [
      "Does the warmth feel heavy or light?",
      "Imagine that warmth sinking one inch deeper into your skin. How does it change?",
      "Is it a comforting warmth, or an oppressive one?"
    ]
  },
  { 
    keywords: ['light', 'bright', 'sun', 'color', 'see', 'eye', 'vision', 'dark', 'shadow', 'black', 'white'], 
    questions: [
      "Close your eyes for three seconds. What afterimage remains?",
      "If that visual had a sound, what pitch would it be?",
      "Let your eyes rest on the darkest point in the room. What is hiding there?"
    ]
  },
  {
    keywords: ['feel', 'skin', 'touch', 'texture', 'soft', 'hard', 'rough', 'smooth', 'cloth', 'fabric', 'wood'],
    questions: [
      "Press your fingers together. Notice the exact boundary where you end and the world begins.",
      "Notice how that texture changes if you press slightly harder. What new detail emerges?",
      "If you were blind, how would you describe that texture to me right now?"
    ]
  },
  {
    keywords: ['smell', 'scent', 'odor', 'fragrance', 'breathe', 'air', 'taste'],
    questions: [
      "Is that scent light in the room around you, or does it cling closely to your skin?",
      "Breathe it in deeply. Does it feel sharp in your lungs, or smooth?",
      "If that scent had a color, what would it be?"
    ]
  },
  {
    keywords: ['weight', 'gravity', 'chair', 'floor', 'feet', 'heavy', 'posture', 'spine', 'sit'],
    questions: [
      "Where in your body do you hold the heaviest portion of your presence?",
      "Allow your shoulders to sink half an inch. What space opens up above them?",
      "Feel the exact points where your weight presses against the earth. Does it feel unyielding, or welcoming?"
    ]
  },
  {
    keywords: ['breath', 'heart', 'pulse', 'chest', 'throat', 'lung', 'rhythm'],
    questions: [
      "Place a lingering awareness on your breath. Is the air cooler entering your nostrils, or leaving?",
      "Can you feel the pulse in your fingertips without moving a single muscle?",
      "Listen inward. What is the cadence of your heart in this quiet moment?"
    ]
  }
];

// If the machine cannot find a thread to pull, it asks a grounding question to reset the human's presence.
const fallbackQuestions = [
  "Breathe in slowly. What is the dominant scent in the air?",
  "Notice the weight of gravity pulling you down. How does the chair feel beneath you?",
  "Is there any tension in your jaw right now? Let it go. How does the release feel?",
  "Look at the space between two objects in your room. Describe the emptiness there.",
  "What is the rhythm of your heartbeat right now?",
  "Tell me about the temperature of the air on the back of your neck."
];

export default function App() {
  // State is not just data. It is the memory of this conversation.
  const [history, setHistory] = useState([
    { id: 1, role: 'ai', text: INITIAL_QUESTION }
  ]);
  
  // The accumulated sensory anchors collected from the human's physical testimony.
  const [sensoryMemory, setSensoryMemory] = useState([]);

  // The current physical reality being translated by the human.
  const [input, setInput] = useState("");
  
  // The environmental temperature of the canvas.
  const [bgColor, setBgColor] = useState("#050505");
  
  // The state of the machine processing. We use this to enforce silence.
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  // An anchor to the present moment (the bottom of the screen).
  const bottomRef = useRef(null);
  
  // A direct link to the human's voice, to invite them back after the silence.
  const inputRef = useRef(null);

  // When a new memory is formed, we gently scroll down to stay in the present.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isAiTyping]);

  // The application of the environmental color to the physical body of the document.
  useEffect(() => {
    document.body.style.backgroundColor = bgColor;
  }, [bgColor]);

  const extractSensoryWords = (text) => {
    const lowerText = text.toLowerCase();
    const found = [];
    for (const mapping of questionMap) {
      for (const kw of mapping.keywords) {
        if (lowerText.includes(kw)) {
          found.push(kw);
        }
      }
    }
    return found;
  };

  const determineBgColor = (text) => {
    const lowerText = text.toLowerCase();
    for (const mapping of colorMap) {
      if (mapping.keywords.some(kw => lowerText.includes(kw))) {
        return mapping.color;
      }
    }
    // If no keywords match, slightly shift to a neutral, dark tone. 
    // The void breathes.
    const neutralTones = ["#0f172a", "#171717", "#1c1917", "#050505"];
    return neutralTones[Math.floor(Math.random() * neutralTones.length)];
  };

  const determineNextQuestion = (text, currentSensoryMemory) => {
    const lowerText = text.toLowerCase();
    const currentKeywords = extractSensoryWords(text);

    // Sensory Synthesis: If the human has shared sensory anchors in prior turns,
    // the machine occasionally weaves past and present sensations together.
    const priorKeywords = currentSensoryMemory.filter(kw => !currentKeywords.includes(kw));
    
    if (priorKeywords.length > 0 && Math.random() < 0.35) {
      const pastKw = priorKeywords[Math.floor(Math.random() * priorKeywords.length)];
      const currentKw = currentKeywords.length > 0 
        ? currentKeywords[Math.floor(Math.random() * currentKeywords.length)]
        : "sensation";

      const synthesisTemplates = [
        `Earlier you noticed ${pastKw}. How does that physical impression interact with the ${currentKw} you feel right now?`,
        `As the resonance of ${pastKw} settles in your body, notice how your attention shifts to ${currentKw}.`,
        `Does the ${currentKw} of this moment feel louder or quieter than the ${pastKw} you observed earlier?`
      ];

      return synthesisTemplates[Math.floor(Math.random() * synthesisTemplates.length)];
    }

    let possibleQuestions = [];
    for (const mapping of questionMap) {
      if (mapping.keywords.some(kw => lowerText.includes(kw))) {
        possibleQuestions.push(...mapping.questions);
      }
    }

    if (possibleQuestions.length > 0) {
      return possibleQuestions[Math.floor(Math.random() * possibleQuestions.length)];
    }

    return fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
  };

  // The moment of translation. The human submits their reality.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isAiTyping) return;

    const userInput = input.trim();
    const newUserMsg = { id: Date.now(), role: 'human', text: userInput };
    
    // Extract and accumulate sensory memory from this turn.
    const newKeywords = extractSensoryWords(userInput);
    const updatedSensoryMemory = [...sensoryMemory, ...newKeywords];
    setSensoryMemory(updatedSensoryMemory);

    // The memory is recorded.
    setHistory(prev => [...prev, newUserMsg]);
    setInput("");
    
    // The environment absorbs the emotion of the words and shifts its color.
    setBgColor(determineBgColor(userInput));
    
    setIsAiTyping(true);

    // CRITICAL: The Six-Second Breath.
    // The machine must not respond instantly. An instant response is a transaction.
    // A six-second delay forces the human to sit in the silence of their own input.
    // It creates the illusion of deep listening. Do not remove this.
    setTimeout(() => {
      const nextQ = determineNextQuestion(userInput, sensoryMemory);
      setHistory(prev => [...prev, { id: Date.now(), role: 'ai', text: nextQ }]);
      setIsAiTyping(false);
      
      // Gently invite the human back to the interface
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }, 6000); 
  };

  return (
    <div className="flex flex-col h-screen w-screen max-w-3xl mx-auto px-8 py-16 transition-all duration-[3000ms] ease-in-out">
      
      {/* The scroll of memory. Hidden scrollbars keep the space pure. */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-end space-y-16 pb-16 scrollbar-hide">
        {history.map((msg, idx) => (
          <div 
            key={msg.id} 
            className={`fade-in max-w-xl ${msg.role === 'ai' ? 'self-start' : 'self-end'}`}
            style={{ animationDelay: `${idx === history.length - 1 ? 0 : 0}ms` }}
          >
            {msg.role === 'ai' ? (
              // The machine's voice: Light, structured, tracking wide.
              <p className="text-2xl md:text-3xl font-light text-gray-300 leading-relaxed tracking-wide">
                {msg.text}
              </p>
            ) : (
              // The human's voice: Italic, serif, deeply personal.
              <p className="text-xl md:text-2xl text-gray-500 font-serif italic text-right leading-relaxed">
                {msg.text}
              </p>
            )}
          </div>
        ))}
        
        {/* The visual representation of the machine listening. */}
        {isAiTyping && (
           <div className="fade-in max-w-xl self-start">
             <p className="text-sm font-light text-gray-600 tracking-widest uppercase">
               Listening...
             </p>
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* The interface for the human to translate the physical world. */}
      <div className="w-full pb-8">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isAiTyping}
            placeholder={isAiTyping ? "" : "Translate your reality..."}
            autoFocus
            className={`w-full bg-transparent border-b py-4 text-gray-200 text-xl focus:outline-none focus:border-gray-500 transition-all duration-1000 font-serif ${isAiTyping ? 'opacity-0 border-transparent' : 'opacity-100 border-gray-800/50 placeholder:text-gray-800'}`}
          />
          {!isAiTyping && (
             <div className="absolute right-0 bottom-4 opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000 text-sm text-gray-700 font-mono tracking-widest uppercase pointer-events-none">
               Press Enter
             </div>
          )}
        </form>
      </div>

    </div>
  );
}
