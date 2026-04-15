import { useState, useEffect, useCallback } from "react";
import {
  Wallet, Plus, ArrowLeft, TrendingUp, TrendingDown,
  ShoppingBag, CreditCard, PiggyBank, Trash2, Zap, DollarSign
} from "lucide-react";
import { financeApiNew } from "../lib/api/index";
import type { Transaction, WishlistItem, Commitment } from "../types/new";

const BG = "#020617";
const CARD_BG = "rgba(15, 23, 42, 0.7)";
const BORDER_COLOR = "rgba(51, 65, 85, 0.4)";
const ACCENT = "#10B981"; // Green for Finance

const TABS = [
  { id: "transactions", label: "المعاملات", icon: CreditCard },
  { id: "wishlist", label: "أتمنى", icon: ShoppingBag },
  { id: "commitments", label: "الالتزامات", icon: PiggyBank },
] as const;

type TabId = typeof TABS[number]["id"];

export default function FinanceScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<TabId>("transactions");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);

  const SystemLogo = () => (
    <div style={{
      width: 40, height: 40, borderRadius: "12px",
      background: `linear-gradient(135deg, ${ACCENT}, #059669)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px ${ACCENT}30`
    }}>
      <Wallet color="white" size={20} />
    </div>
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [tRes, wRes, cRes] = await Promise.all([
      financeApiNew.transactions.list(),
      financeApiNew.wishlist.list(),
      financeApiNew.commitments.list(),
    ]);
    if (tRes.success && tRes.data) setTransactions(tRes.data);
    if (wRes.success && wRes.data) setWishlist(wRes.data);
    if (cRes.success && cRes.data) setCommitments(cRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const totalIncome = transactions.filter(t => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0);
  const totalSadaqah = transactions.filter(t => t.type === "sadaqah").reduce((a, t) => a + t.amount, 0);
  const balance = totalIncome - totalExpense - totalSadaqah;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#F1F5F9", paddingBottom: 60 }}>
       <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;700;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet" />
       <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .glass-card { background: ${CARD_BG}; backdrop-filter: blur(12px); border: 1px solid ${BORDER_COLOR}; border-radius: 24px; }
      `}</style>

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 40px", borderBottom: `1px solid ${BORDER_COLOR}`, background: "rgba(2, 6, 23, 0.8)",
        backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
          <ArrowLeft size={18} /> الرئيسية
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>الماليات</h1>
            <p style={{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", fontWeight: 700, margin: 0 }}>FINANCE ENGINE</p>
          </div>
          <SystemLogo />
        </div>
      </header>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* Summary Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32, animation: "fadeInUp 0.6s ease-out" }}>
           {[
             { label: "الرصيد الكلي", value: balance, color: balance >= 0 ? "#10B981" : "#EF4444", icon: Wallet },
             { label: "إجمالي الدخل", value: totalIncome, color: "#10B981", icon: TrendingUp },
             { label: "المصروفات", value: totalExpense, color: "#EF4444", icon: TrendingDown },
             { label: "الصدقات", value: totalSadaqah, color: "#6366F1", icon: Zap },
           ].map((s, i) => (
             <div key={i} className="glass-card" style={{ padding: 20, textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.05 }}><s.icon size={60} color={s.color} /></div>
                <p style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 8, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{s.label}</p>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value.toLocaleString()}</h3>
             </div>
           ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px", animation: "fadeInUp 0.6s ease-out 0.1s both" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "14px", borderRadius: "16px", cursor: "pointer", fontSize: "14px", fontWeight: 700,
              background: tab === t.id ? `${ACCENT}15` : CARD_BG,
              border: `1px solid ${tab === t.id ? ACCENT : BORDER_COLOR}`,
              color: tab === t.id ? ACCENT : "#94A3B8",
              fontFamily: "'Noto Kufi Arabic', sans-serif", transition: "all 0.3s"
            }}>{t.label}</button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>جاري مزامنة حساباتك...</div> : (
          <div style={{ animation: "fadeInUp 0.6s ease-out 0.2s both" }}>
            {tab === "transactions" && transactions.map((t, i) => (
              <div key={t.id} className="glass-card" style={{ padding: "16px 24px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
                 <div style={{
                   width: 44, height: 44, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
                   background: (t.type === "income" ? "#10B981" : "#EF4444") + "15",
                   color: t.type === "income" ? "#10B981" : "#EF4444"
                 }}>
                   {t.type === "income" ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                 </div>
                 <div style={{ flex: 1 }}>
                   <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{t.title}</p>
                   <p style={{ fontSize: 11, color: "#64748B" }}>{t.category} · {t.date}</p>
                 </div>
                 <div style={{ fontSize: 18, fontWeight: 900, color: t.type === "income" ? "#10B981" : "#EF4444", fontFamily: "'JetBrains Mono', monospace" }}>
                   {t.type === "income" ? "+" : "-"}{t.amount.toLocaleString()}
                 </div>
              </div>
            ))}

            {tab === "wishlist" && wishlist.map((w, i) => (
              <div key={w.id} className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{w.name}</h3>
                    <div style={{ textAlign: "right" }}>
                       <span style={{ fontSize: 16, fontWeight: 900, color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>{w.price.toLocaleString()}</span>
                       <span style={{ fontSize: 10, color: "#64748B", display: "block" }}>TARGET PRICE</span>
                    </div>
                 </div>
                 <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ width: `${(w.savedAmount / w.price) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${ACCENT}, #34D399)`, borderRadius: 10 }} />
                 </div>
                 <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: "#64748B", fontWeight: 700 }}>
                    <span>Progress: {Math.round((w.savedAmount / w.price) * 100)}%</span>
                    <span style={{ color: ACCENT }}>Saved: {w.savedAmount.toLocaleString()}</span>
                 </div>
              </div>
            ))}

            {tab === "commitments" && commitments.map((c, i) => (
              <div key={c.id} className="glass-card" style={{ padding: 20, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "12px", background: "#EF444410", display: "flex", alignItems: "center", justifyContent: "center" }}>
                       <PiggyBank size={20} color="#EF4444" />
                    </div>
                    <div>
                       <p style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{c.name}</p>
                       <p style={{ fontSize: 11, color: "#64748B" }}>موعد الاستحقاق: {c.dueDate}</p>
                    </div>
                 </div>
                 <div style={{ fontSize: 18, fontWeight: 900, color: "#EF4444", fontFamily: "'JetBrains Mono', monospace" }}>
                    {c.amount.toLocaleString()}
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
