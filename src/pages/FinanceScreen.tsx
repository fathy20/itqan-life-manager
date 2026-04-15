/**
 * FinanceScreen — Transactions, Wishlist, Commitments, Salary
 * Connected to: financeApiNew
 */
import { useState, useEffect, useCallback } from "react";
import {
  Wallet, Plus, ArrowLeft, TrendingUp, TrendingDown,
  ShoppingBag, CreditCard, PiggyBank, Trash2,
} from "lucide-react";
import { financeApiNew } from "../lib/api/index";
import type { Transaction, WishlistItem, Commitment } from "../types/new";

const BG = "#000E30";
const CARD = "#0A1628";
const BORDER = "#0F2847";
const TEXT = "#C0C8D8";
const MUTED = "#3D5A80";
const GREEN = "#10B981";
const RED = "#F87171";
const ACCENT = "#4ADE80";

const TABS = [
  { id: "transactions", label: "المعاملات", icon: CreditCard },
  { id: "wishlist", label: "أتمنى", icon: ShoppingBag },
  { id: "commitments", label: "الالتزامات", icon: PiggyBank },
] as const;

type TabId = typeof TABS[number]["id"];

function TransactionForm({ onSave, onCancel }: { onSave: (t: Partial<Transaction>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<Transaction["type"]>("expense");
  const [category, setCategory] = useState("أخرى");
  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="الوصف..." style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 15, color: TEXT, fontFamily: "'Noto Kufi Arabic', sans-serif", marginBottom: 12 }} />
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="المبلغ" style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", color: TEXT, fontSize: 14, marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {(["income", "expense", "sadaqah"] as const).map(t => (
          <button key={t} onClick={() => setType(t)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            background: type === t ? (t === "income" ? GREEN : t === "expense" ? RED : "#818CF8") + "20" : "transparent",
            border: `1px solid ${type === t ? (t === "income" ? GREEN : t === "expense" ? RED : "#818CF8") : BORDER}`,
            color: type === t ? (t === "income" ? GREEN : t === "expense" ? RED : "#818CF8") : MUTED,
          }}>{t === "income" ? "دخل" : t === "expense" ? "مصروف" : "صدقة"}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, cursor: "pointer", fontSize: 13 }}>إلغاء</button>
        <button onClick={() => { if (title.trim() && amount) onSave({ title, amount: parseFloat(amount), type, category, date: today }); }}
          style={{ padding: "8px 20px", borderRadius: 8, background: ACCENT + "20", border: `1px solid ${ACCENT}40`, color: ACCENT, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>إضافة</button>
      </div>
    </div>
  );
}

export default function FinanceScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<TabId>("transactions");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [salary, setSalary] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [tRes, wRes, cRes, sRes] = await Promise.all([
      financeApiNew.transactions.list(),
      financeApiNew.wishlist.list(),
      financeApiNew.commitments.list(),
      financeApiNew.getSalary(),
    ]);
    if (tRes.success && tRes.data) setTransactions(tRes.data);
    if (wRes.success && wRes.data) setWishlist(wRes.data);
    if (cRes.success && cRes.data) setCommitments(cRes.data);
    if (sRes.success && sRes.data) setSalary(sRes.data.monthlySalary);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addTransaction = async (data: Partial<Transaction>) => {
    const res = await financeApiNew.transactions.create(data);
    if (res.success && res.data) { setTransactions(prev => [res.data!, ...prev]); setShowForm(false); }
  };

  const deleteTransaction = async (id: string) => {
    const res = await financeApiNew.transactions.delete(id);
    if (res.success) setTransactions(prev => prev.filter(x => x.id !== id));
  };

  const totalIncome = transactions.filter(t => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0);
  const totalSadaqah = transactions.filter(t => t.type === "sadaqah").reduce((a, t) => a + t.amount, 0);
  const balance = totalIncome - totalExpense - totalSadaqah;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, background: BG, zIndex: 10 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, cursor: "pointer", fontSize: 13 }}><ArrowLeft size={16} /> الرئيسية</button>
        <div style={{ flex: 1 }} />
        <Wallet size={20} color={ACCENT} />
        <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>الماليات</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "الرصيد", value: balance, color: balance >= 0 ? GREEN : RED },
            { label: "الدخل", value: totalIncome, color: GREEN },
            { label: "المصروفات", value: totalExpense, color: RED },
            { label: "الصدقات", value: totalSadaqah, color: "#818CF8" },
          ].map(s => (
            <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
              borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 600,
              background: tab === t.id ? ACCENT + "15" : CARD,
              border: `1px solid ${tab === t.id ? ACCENT + "40" : BORDER}`,
              color: tab === t.id ? ACCENT : MUTED,
              fontFamily: "'Noto Kufi Arabic', sans-serif", transition: "all 0.2s",
            }}><t.icon size={16} /> {t.label}</button>
          ))}
        </div>

        {/* Content */}
        {tab === "transactions" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: MUTED }}>{transactions.length} معاملة</span>
              <button onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: ACCENT + "15", border: `1px solid ${ACCENT}30`, color: ACCENT, cursor: "pointer", fontSize: 13 }}><Plus size={16} /> جديدة</button>
            </div>
            {showForm && <TransactionForm onSave={addTransaction} onCancel={() => setShowForm(false)} />}
            {loading ? <div style={{ textAlign: "center", padding: 60, color: MUTED }}>جاري التحميل...</div> :
              transactions.map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 8, animation: "fadeIn 0.3s" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: (t.type === "income" ? GREEN : t.type === "sadaqah" ? "#818CF8" : RED) + "15" }}>
                    {t.type === "income" ? <TrendingUp size={16} color={GREEN} /> : <TrendingDown size={16} color={t.type === "sadaqah" ? "#818CF8" : RED} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>{t.category} · {t.date}</div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: t.type === "income" ? GREEN : RED }}>{t.type === "income" ? "+" : "-"}{t.amount.toLocaleString()}</span>
                  <button onClick={() => deleteTransaction(t.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#F8717140", padding: 4 }}><Trash2 size={14} /></button>
                </div>
              ))
            }
          </div>
        )}

        {tab === "wishlist" && (
          <div>
            {wishlist.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: MUTED }}>لا توجد أمنيات بعد</div> :
              wishlist.map(w => (
                <div key={w.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{w.name}</span>
                    <span style={{ fontSize: 12, color: ACCENT }}>{w.savedAmount}/{w.price}</span>
                  </div>
                  <div style={{ height: 6, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${w.price > 0 ? (w.savedAmount / w.price) * 100 : 0}%`, background: ACCENT, borderRadius: 3 }} />
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {tab === "commitments" && (
          <div>
            {commitments.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: MUTED }}>لا توجد التزامات</div> :
              commitments.map(c => (
                <div key={c.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>{c.type === "installment" ? "قسط" : "جمعية"} · {c.dueDate}</div>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: RED, fontFamily: "'JetBrains Mono', monospace" }}>{c.amount.toLocaleString()}</span>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}
