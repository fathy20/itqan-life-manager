import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Zap, 
  Target, 
  Award,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const TelegramCoach: React.FC = () => {
  const { state } = useApp();
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'bot',
      text: `أهلاً بك يا ${state.profile.name}! أنا مدربك الشخصي. كيف يمكنني مساعدتك اليوم في إدارة أهدافك؟`,
      time: new Date(Date.now() - 3600000).toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;
    
    const userText = inputText;
    const newUserMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);
    
    try {
      const token = await import('../lib/firebase').then(m => m.auth.currentUser?.getIdToken());
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/ai/coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-10)
        })
      });

      const data = await res.json();
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.data?.text || data.text || "عذراً، حدث خطأ.",
        time: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Coach error:", error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.",
        time: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]">
            <MessageCircle size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">المدرب الشخصي (Telegram AI)</h2>
            <p className="text-xs text-white/40">متصل الآن | استراتيجية، هندسة، تدريب</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase">الذكاء الاصطناعي نشط</span>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden">
        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col glass-card p-0 overflow-hidden border-white/10">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex gap-4 max-w-[80%]",
                    msg.sender === 'user' ? "mr-auto flex-row-reverse" : "ml-auto"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    msg.sender === 'bot' ? "bg-brand-500 text-white" : "bg-white/10 text-white/60"
                  )}>
                    {msg.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    msg.sender === 'bot' 
                      ? "bg-white/5 border border-white/10 text-white/90 rounded-tr-none" 
                      : "bg-brand-500 text-white rounded-tl-none font-medium shadow-lg shadow-brand-500/20"
                  )}>
                    {msg.text}
                    <div className={cn(
                      "text-[10px] mt-2",
                      msg.sender === 'bot' ? "text-white/20" : "text-white/60"
                    )}>
                      {format(new Date(msg.time), 'HH:mm')}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 ml-auto"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tr-none flex items-center gap-2">
                    <Loader2 size={16} className="text-brand-400 animate-spin" />
                    <span className="text-xs text-white/40">المدرب يفكر...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 bg-white/5 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                disabled={isTyping}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isTyping ? "المدرب يكتب رداً..." : "تحدث مع مدربك الشخصي..."}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isTyping || !inputText.trim()}
                className="w-12 h-12 bg-brand-500 hover:bg-brand-600 disabled:bg-white/10 disabled:text-white/20 rounded-xl flex items-center justify-center text-white transition-all active:scale-95"
              >
                {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Insights Sidebar */}
        <div className="hidden lg:flex flex-col gap-6 overflow-y-auto">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/40 flex items-center gap-2">
              <Zap size={14} className="text-yellow-400" />
              رؤى سريعة (Insights)
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={14} className="text-brand-400" />
                  <span className="text-xs font-bold">التركيز الأكاديمي</span>
                </div>
                <p className="text-[10px] text-white/60 leading-relaxed">
                  أنت متأخر في 3 محاضرات من مادة SET321. أنصح بجلسة "Deep Work" لمدة ساعتين اليوم.
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={14} className="text-emerald-400" />
                  <span className="text-xs font-bold">إنجاز مالي</span>
                </div>
                <p className="text-[10px] text-white/60 leading-relaxed">
                  لقد حققت 80% من هدف الدخل الشهري من الفريلانس. استمر!
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/40 flex items-center gap-2">
              <Clock size={14} className="text-indigo-400" />
              تذكيرات قادمة
            </h3>
            <div className="space-y-3">
              {[
                { time: '18:00', text: 'مراجعة تقرير FlightAssist' },
                { time: '20:30', text: 'جلسة مذاكرة Microcontrollers' },
                { time: '22:00', text: 'أذكار المساء وورد القرآن' }
              ].map((rem, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="text-indigo-400 font-bold">{rem.time}</span>
                  <span className="text-white/60">{rem.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <p className="text-[10px] text-red-400/80 leading-relaxed">
              تحذير: ضغط العمل غداً مرتفع جداً. أنصح بإنهاء مهام اليوم مبكراً للنوم 7 ساعات على الأقل.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramCoach;
