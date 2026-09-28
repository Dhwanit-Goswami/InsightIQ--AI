import React, { useState, useEffect, useRef } from 'react';
import { sendAIMessage } from '../services/api';
import { FiSend, FiCpu, FiTrash2, FiArrowRight } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { userData } from '../data/mockUser';

const suggestedPrompts = [
  'Why did revenue change this month?',
  'Which products are underperforming?',
  'Where are our biggest expenses?',
  'What business risks should I review?',
  'What should I focus on this week?',
];

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Seed initial professional conversation
    setMessages([
      {
        id: 1,
        role: 'user',
        content: 'Why did revenue change this month?',
        timestamp: '9:30 AM',
      },
      {
        id: 2,
        role: 'assistant',
        timestamp: '9:30 AM',
        structured: {
          answer: 'Monthly revenue grew 12.4% (to ₹24.8L), driven primarily by retail reorders in Mumbai and Pune hubs.',
          evidence: '• Mumbai hub sales: +18.2% (₹9.8L contribution)\n• Pune hub sales: +14.1% (₹6.4L contribution)\n• Average Order Value (AOV): Increased from ₹58,200 to ₹64,500\n• Top SKU: Enterprise Analytics Suite contributed ₹8.4L',
          explanation: 'Retail demand accelerated ahead of the festive inventory cycle. Reorder frequency among established SMEs increased from 1.2 to 1.8 orders per month, with minimal customer acquisition cost increase.',
          recommendation: 'Pre-allocate 15% additional warehouse inventory in Bhiwandi (Mumbai) and verify logistics lead times with BluePeak Logistics to protect margins.',
          sources: 'Sales Ledger, GST E-Invoicing records, Regional Distribution manifests',
          confidence: '94% • Based on 3,842 verified invoices across FY25',
        },
      },
    ]);
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendAIMessage(text);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, ...response.data },
      ]);
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
    <div className="h-[calc(100vh-104px)] flex flex-col space-y-4">
      {/* ─── Header ─── */}
      <div className="flex-shrink-0 pb-3 border-b border-light-border dark:border-dark-border flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary tracking-tight">
              AI Decision Analyst
            </h1>
            <Badge variant="neutral">Verified ERP Data</Badge>
          </div>
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">
            Query business metrics, financial anomalies, and strategic forecasts in natural language.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 text-xs text-light-text-muted dark:text-dark-text-muted hover:text-danger transition-colors cursor-pointer"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            <span>Clear conversation</span>
          </button>
        )}
      </div>

      {/* ─── Conversation Stream ─── */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-2">
        {/* Welcome Empty State (Section 19) */}
        {messages.length === 0 && !loading && (
          <div className="max-w-2xl mx-auto py-8 px-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-center mx-auto text-primary">
              <FiCpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary tracking-tight">
                What would you like to understand?</h2>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1 max-w-md mx-auto leading-relaxed">
                InsightIQ synthesizes sales orders, accounts payable, inventory buffer levels, and customer account records to deliver structured, evidence-backed answers.
              </p>
            </div>

            {/* Suggested Prompts Grid */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="p-3 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-600 transition-colors text-xs text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary cursor-pointer flex items-center justify-between gap-2 shadow-card dark:shadow-card-dark"
                >
                  <span className="font-medium">"{prompt}"</span>
                  <FiArrowRight className="w-3.5 h-3.5 text-light-text-muted dark:text-dark-text-muted flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Items */}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Assistant Icon */}
            {m.role !== 'user' && (
              <div className="w-7 h-7 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-center flex-shrink-0 text-primary mt-0.5">
                <FiCpu className="w-3.5 h-3.5" />
              </div>
            )}

            {/* User Message Bubble */}
            {m.role === 'user' ? (
              <div className="max-w-[85%] sm:max-w-[70%] rounded-xl px-4 py-2.5 bg-primary text-white text-xs sm:text-sm leading-relaxed shadow-card">
                <p className="font-medium">{m.content}</p>
                <span className="block text-[10px] text-white/70 text-right mt-1 font-normal">
                  {m.timestamp}
                </span>
              </div>
            ) : (
              /* Structured Business Analyst Response (Section 19: Answer, Evidence, Explanation, Recommendation, Sources) */
              <div className="max-w-[95%] sm:max-w-[85%] rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-4 sm:p-5 shadow-card dark:shadow-card-dark text-xs sm:text-sm space-y-4">
                {m.structured ? (
                  <>
                    {/* 1. Answer */}
                    <div className="pb-3 border-b border-light-border dark:border-dark-border">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-light-text-muted dark:text-dark-text-muted block mb-1">
                        Executive Answer
                      </span>
                      <p className="font-semibold text-light-text-primary dark:text-dark-text-primary text-sm sm:text-base leading-snug">
                        {m.structured.answer}
                      </p>
                    </div>

                    {/* 2. Evidence */}
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-light-text-muted dark:text-dark-text-muted block mb-1">
                        Evidence & Metrics
                      </span>
                      <div className="p-3 rounded-lg bg-light-surface/60 dark:bg-dark-surface/60 border border-light-border dark:border-dark-border font-mono text-xs text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-line leading-relaxed">
                        {m.structured.evidence}
                      </div>
                    </div>

                    {/* 3. Explanation */}
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-light-text-muted dark:text-dark-text-muted block mb-1">
                        Explanation
                      </span>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm leading-relaxed">
                        {m.structured.explanation}
                      </p>
                    </div>

                    {/* 4. Recommendation */}
                    <div className="p-3 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-primary block mb-0.5">
                        Recommended Action
                      </span>
                      <p className="font-medium text-light-text-primary dark:text-dark-text-primary text-xs sm:text-sm leading-relaxed">
                        {m.structured.recommendation}
                      </p>
                    </div>

                    {/* 5. Sources & Verification */}
                    <div className="pt-2 border-t border-light-border dark:border-dark-border flex flex-wrap items-center justify-between gap-2 text-[11px] text-light-text-muted dark:text-dark-text-muted">
                      <div>
                        <span>Sources: </span>
                        <strong className="text-light-text-secondary dark:text-dark-text-secondary font-medium">
                          {m.structured.sources}
                        </strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" />
                        <span>Confidence: {m.structured.confidence}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-light-text-primary dark:text-dark-text-primary leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </p>
                  </div>
                )}
                <div className="text-[10px] text-light-text-muted dark:text-dark-text-muted text-right font-normal">
                  {m.timestamp}
                </div>
              </div>
            )}

            {/* User Avatar */}
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-center flex-shrink-0 text-xs font-semibold text-light-text-primary dark:text-dark-text-primary mt-0.5 shadow-sm">
                {user?.name ? ((user.name.split(' ')[0]?.[0] || '') + (user.name.split(' ')[1]?.[0] || 'U')).toUpperCase() : userData.initials}
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-center flex-shrink-0 text-primary mt-0.5">
              <FiCpu className="w-3.5 h-3.5" />
            </div>
            <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-3.5 flex items-center gap-2 text-xs text-light-text-muted dark:text-dark-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>Analyzing historical records and formulating recommendation...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* ─── Bottom Input Bar with Suggested Prompts Bar ─── */}
      <div className="flex-shrink-0 pt-3 border-t border-light-border dark:border-dark-border space-y-2.5">
        {/* Quick prompt pills if conversation active */}
        {messages.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] text-light-text-muted dark:text-dark-text-muted font-medium flex-shrink-0">
              Suggested:
            </span>
            {suggestedPrompts.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="flex-shrink-0 px-2.5 py-1 rounded-md bg-light-surface dark:bg-dark-surface hover:bg-slate-200/70 dark:hover:bg-dark-border/60 border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary text-[11px] transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about business performance, cash flow, margins, or forecasts..."
            className="input-field pr-20 py-2.5 text-xs sm:text-sm"
            disabled={loading}
          />
          <div className="absolute right-1.5 flex items-center gap-1">
            <Button
              type="submit"
              size="sm"
              disabled={loading || !input.trim()}
              className="py-1 px-3 text-xs"
            >
              <FiSend className="w-3 h-3 mr-1" />
              <span>Analyze</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
