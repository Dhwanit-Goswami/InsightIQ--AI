import React, { useState, useEffect, useRef } from 'react';
import { getAIChatHistory, getSuggestedPrompts, sendAIMessage } from '../services/api';
import { FiSend, FiZap, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { userData } from '../data/mockUser';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, sugRes] = await Promise.all([
          getAIChatHistory(),
          getSuggestedPrompts()
        ]);
        setMessages(histRes.data);
        setSuggestions(sugRes.data);
      } catch (err) {
        console.error('Error fetching chat data', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendAIMessage(text);
      setMessages(prev => [...prev, { id: Date.now() + 1, ...response.data }]);
    } catch (err) {
      console.error('Chat error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex-shrink-0 pb-4 border-b border-light-border dark:border-dark-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
            <FiZap className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-light-text-primary dark:text-dark-text-primary leading-tight">Nexus AI Copilot</h1>
            <p className="text-xs text-success flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 bg-success rounded-full" /> Decision Core Active & Online
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 text-xs text-light-text-muted dark:text-dark-text-muted hover:text-danger transition-colors font-medium"
          >
            <FiTrash2 className="w-3.5 h-3.5" /> Clear Chat
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Empty state */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
              <FiMessageSquare className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">Ask your AI Business Analyst</p>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1 max-w-xs">
                Ask anything about revenue, customers, forecasts, risk, or operational performance.
              </p>
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role !== 'user' && (
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <FiZap className="w-4 h-4" />
              </div>
            )}
            <div className={`
              max-w-[82%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-xs
              ${m.role === 'user'
                ? 'bg-primary text-white rounded-tr-xs'
                : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary rounded-tl-xs'
              }
            `}>
              {m.content}
              <div className={`text-[10px] mt-2 text-right ${m.role === 'user' ? 'text-white/70' : 'text-light-text-muted dark:text-dark-text-muted'}`}>{m.timestamp}</div>
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-center flex-shrink-0 text-light-text-primary dark:text-dark-text-primary text-xs font-bold shadow-xs">
                {userData.initials}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <FiZap className="w-4 h-4" />
            </div>
            <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl rounded-tl-xs p-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested & Input Area */}
      <div className="flex-shrink-0 pt-3 border-t border-light-border dark:border-dark-border space-y-3">
        {/* Suggested Queries */}
        {messages.length < 5 && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 4).map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary px-3 py-1.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left truncate max-w-full"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask any decision support query... (e.g. show my revenue projection)"
            className="input-field pr-12 py-3"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all text-white"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
