import { useState } from "react";
import {
  Wallet, Lock, Eye, EyeOff, Plus, TrendingUp, TrendingDown,
  Target, Star, Award, BarChart3, Heart, CheckCircle2,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Sparkles, Calendar
} from "lucide-react";

const mono = "'JetBrains Mono', monospace"; const ar = "'Noto Kufi Arabic', sans-serif";
const BG = "#000E30"; const CARD = "#071A3A"; const BORDER = "#0C2550";
const CYAN = "#08A7E7"; const MUTED = "#3D5A80"; const TEXT = "#C0C8D8"; const BRIGHT = "#E8EBF0";

const TRANSACTIONS = [
  { title: "Salary — University TA", amount: 3500, type: "income", cat: "salary", date: "Mar 28" },
  { title: "Freelance — FlightAssist", amount: 2000, type: "income", cat: "freelance", date: "Mar 25" },
  { title: "Groceries", amount: -450, type: "expense", cat: "food", date: "Mar 29" },
  { title: "Internet bill", amount: -200, type: "expense", cat: "bills", date: "Mar 28" },
  { title: "Sadaqah — mosque", amount: -100, type: "sadaqah", cat: "charity", date: "Mar 27" },
  { title: "Uber rides", amount: -180, type: "expense", cat: "transport", date: "Mar 26" },
  { title: "Coffee & snacks", amount: -120, type: "expense", cat: "food", date: "Mar 25" },
];

const WISHLIST = [
  { name: "MacBook Air M3", price: 45000, saved: 28000, priority: "high" },
  { name: "iPad for notes", price: 18000, saved: 5000, priority: "medium" },
  { name: "Quran stand (Rehal)", price: 350, saved: 350, priority: "done" },
];

const COMMITMENTS = [
  { name: "Gam'eya (savings group)", amount: 500, dueDate: "Apr 1", type: "savings" },
  { name: "Phone installment", amount: 800, dueDate: "Apr 5", type: "installment" },
];

function Card({ children, style, glow }) {
  return (
    <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", position: "relative", overflow: "hidden", ...style }}>
      {glow && <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: glow, opacity: 0.04, filter: "blur(30px)", pointerEvents: "none" }} />}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

export default function FinanceSystem() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [showAmounts, setShowAmounts] = useState(true);
  const balance = 7450;
  const income = 5500;
  const expenses = 1050;
  const sadaqah = 100;

  if (!unlocked) {
    return (
      <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`@keyframes fi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } } * { box-sizing:border-box; margin:0; padding:0; }`}</style>
        <div style={{ textAlign: "center", opacity: 0, animation: "fi 0.4s ease forwards" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#4ADE8012", border: "1px solid #4ADE8025", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Lock size={28} color="#4ADE80" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: ar, color: BRIGHT, marginBottom: 4 }}>الماليات محمية</div>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 20 }}>Enter your PIN to access finance</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                background: CARD, border: `2px solid ${pin.length > i ? "#4ADE80" : BORDER}`,
                fontSize: 20, color: BRIGHT, fontFamily: mono,
              }}>{pin.length > i ? "●" : ""}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, width: 200, margin: "0 auto" }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"].map((n, i) => n === null ? <div key={i} /> : (
              <button key={i} onClick={() => {
                if (n === "del") setPin(pin.slice(0, -1));
                else if (pin.length < 4) {
                  const newPin = pin + n;
                  setPin(newPin);
                  if (newPin.length === 4) setTimeout(() => setUnlocked(true), 300);
                }
              }} style={{
                width: 56, height: 56, borderRadius: 12, cursor: "pointer",
                background: CARD, border: `1px solid ${BORDER}`,
                color: TEXT, fontSize: n === "del" ? 12 : 20, fontFamily: mono, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{n === "del" ? "←" : n}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const mask = (v) => showAmounts ? v.toLocaleString() : "••••";

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 32px" }}>
      <style>{`@keyframes fi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } } * { box-sizing:border-box; margin:0; padding:0; }`}</style>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, opacity: 0, animation: "fi 0.4s ease forwards" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Wallet size={20} color="#4ADE80" />
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: ar, color: BRIGHT }}>الماليات</span>
            <span style={{ fontSize: 13, fontFamily: mono, color: MUTED }}>Finance</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowAmounts(!showAmounts)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: CARD, border: `1px solid ${BORDER}`, color: MUTED, display: "flex", alignItems: "center", gap: 6 }}>
            {showAmounts ? <EyeOff size={13} /> : <Eye size={13} />}{showAmounts ? "Hide" : "Show"}
          </button>
          <button style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "#4ADE8010", border: "1px solid #4ADE8025", color: "#4ADE80", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={13} /> Add transaction
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        {[
          { l: "Balance", v: balance, c: CYAN, icon: Wallet },
          { l: "Income", v: income, c: "#34D399", icon: TrendingUp },
          { l: "Expenses", v: expenses, c: "#F87171", icon: TrendingDown },
          { l: "Sadaqah", v: sadaqah, c: "#FBBF24", icon: Heart },
        ].map(s => (
          <Card key={s.l} glow={s.c}>
            <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>{s.l}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: mono, color: s.c }}>{mask(s.v)}</div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>EGP this month</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
        {/* Transactions */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <BarChart3 size={14} color="#60A5FA" />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Recent transactions</span>
          </div>
          {TRANSACTIONS.map((tx, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
              borderRadius: 8, background: BG, border: `1px solid ${BORDER}`, marginBottom: 6,
              opacity: 0, animation: `fi 0.3s ease ${i * 0.04}s forwards`,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                background: tx.amount > 0 ? "#34D39910" : tx.type === "sadaqah" ? "#FBBF2410" : "#F8717110",
              }}>
                {tx.amount > 0 ? <ArrowUpRight size={14} color="#34D399" /> : tx.type === "sadaqah" ? <Heart size={14} color="#FBBF24" /> : <ArrowDownRight size={14} color="#F87171" />}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, color: TEXT }}>{tx.title}</span>
                <div style={{ fontSize: 10, color: MUTED }}>{tx.date} · {tx.cat}</div>
              </div>
              <span style={{
                fontSize: 14, fontWeight: 600, fontFamily: mono,
                color: tx.amount > 0 ? "#34D399" : tx.type === "sadaqah" ? "#FBBF24" : "#F87171",
              }}>
                {showAmounts ? (tx.amount > 0 ? "+" : "") + tx.amount.toLocaleString() : "••••"}
              </span>
            </div>
          ))}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Zakat */}
          <Card glow="#FBBF24">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Star size={14} color="#FBBF24" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Zakat status</span>
            </div>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: BG, fontSize: 12, color: TEXT, lineHeight: 1.6 }}>
              <div>Zakatable assets: <span style={{ fontFamily: mono, color: "#FBBF24" }}>{mask(42000)} EGP</span></div>
              <div>Nisab threshold: <span style={{ fontFamily: mono, color: MUTED }}>~38,000 EGP</span></div>
              <div>Zakat due (2.5%): <span style={{ fontFamily: mono, color: "#FBBF24", fontWeight: 700 }}>{mask(1050)} EGP</span></div>
              <div style={{ marginTop: 4 }}>Hawl date: <span style={{ fontFamily: mono, color: MUTED }}>Ramadan 1448</span></div>
            </div>
          </Card>

          {/* Wishlist */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Target size={14} color="#A78BFA" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Wishlist</span>
            </div>
            {WISHLIST.map(w => {
              const pct = Math.round((w.saved / w.price) * 100);
              return (
                <div key={w.name} style={{ padding: "10px 12px", borderRadius: 8, background: BG, border: `1px solid ${BORDER}`, marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: TEXT }}>{w.name}</span>
                    <span style={{ fontSize: 10, fontFamily: mono, color: pct >= 100 ? "#34D399" : "#FBBF24" }}>{pct}%</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: "#0C2550", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, borderRadius: 2, background: pct >= 100 ? "#34D399" : "#A78BFA" }} />
                  </div>
                  <div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>
                    {showAmounts ? `${w.saved.toLocaleString()} / ${w.price.toLocaleString()} EGP` : "•••• / •••• EGP"}
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Commitments */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Calendar size={14} color="#FB923C" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Commitments</span>
            </div>
            {COMMITMENTS.map(c => (
              <div key={c.name} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", borderRadius: 8, background: BG, border: `1px solid ${BORDER}`, marginBottom: 6,
              }}>
                <div>
                  <span style={{ fontSize: 12, color: TEXT }}>{c.name}</span>
                  <div style={{ fontSize: 10, color: MUTED }}>Due: {c.dueDate}</div>
                </div>
                <span style={{ fontSize: 13, fontFamily: mono, fontWeight: 600, color: "#FB923C" }}>
                  {showAmounts ? c.amount.toLocaleString() : "••••"} EGP
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
