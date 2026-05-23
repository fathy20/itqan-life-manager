import { useState } from "react";
import type { ElementType, ReactNode } from "react";
import { ArrowLeft, CreditCard, PiggyBank, Plus, ShoppingBag, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { LegacyCommitment, LegacyTransaction, LegacyWishlistItem } from "../types";
import { calculateFinanceSummary, normalizeSavingsAmount, wishlistProgress } from "../lib/modules/finance";

const tabs = [
  { id: "transactions", label: "المعاملات", icon: CreditCard },
  { id: "wishlist", label: "الأمنيات", icon: ShoppingBag },
  { id: "commitments", label: "الالتزامات", icon: PiggyBank },
] as const;

type TabId = (typeof tabs)[number]["id"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function TransactionForm({ onSave, onCancel }: { onSave: (transaction: Omit<LegacyTransaction, "id">) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("عام");
  const [date, setDate] = useState(todayIso());
  const [error, setError] = useState("");

  const submit = () => {
    const value = Number(amount);
    if (!title.trim()) {
      setError("اكتب وصف المعاملة.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError("اكتب مبلغ صحيح أكبر من صفر.");
      return;
    }
    onSave({ title: title.trim(), amount: value, type, category: category.trim() || "عام", date });
  };

  return (
    <Panel>
      <div className="mb-4">
        <Field label="الوصف">
          <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: مصاريف مواصلات" autoFocus />
        </Field>
      </div>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <Field label="المبلغ">
          <input className="field-input" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </Field>
        <Field label="التاريخ">
          <input className="field-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <Field label="النوع">
          <select className="field-input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">مصروف</option>
            <option value="income">دخل</option>
            <option value="sadaqah">صدقة</option>
          </select>
        </Field>
        <Field label="التصنيف">
          <input className="field-input" value={category} onChange={(e) => setCategory(e.target.value)} />
        </Field>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      <FormActions onCancel={onCancel} onSubmit={submit} submitLabel="إضافة معاملة" color="emerald" />
    </Panel>
  );
}

function WishlistForm({ onSave, onCancel }: { onSave: (item: Omit<LegacyWishlistItem, "id">) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [savedAmount, setSavedAmount] = useState("0");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [error, setError] = useState("");

  const submit = () => {
    const itemPrice = Number(price);
    const saved = Number(savedAmount);
    if (!name.trim()) {
      setError("اكتب اسم الأمنية.");
      return;
    }
    if (!Number.isFinite(itemPrice) || itemPrice <= 0) {
      setError("اكتب السعر بشكل صحيح.");
      return;
    }
    onSave({ name: name.trim(), price: itemPrice, savedAmount: Number.isFinite(saved) ? saved : 0, priority });
  };

  return (
    <Panel>
      <div className="mb-4">
        <Field label="اسم الأمنية">
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: لابتوب جديد" autoFocus />
        </Field>
      </div>
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Field label="السعر">
          <input className="field-input" type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="المبلغ المدخر">
          <input className="field-input" type="number" min={0} value={savedAmount} onChange={(e) => setSavedAmount(e.target.value)} />
        </Field>
        <Field label="الأولوية">
          <select className="field-input" value={priority} onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}>
            <option value="high">عالية</option>
            <option value="medium">متوسطة</option>
            <option value="low">منخفضة</option>
          </select>
        </Field>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      <FormActions onCancel={onCancel} onSubmit={submit} submitLabel="إضافة أمنية" color="emerald" />
    </Panel>
  );
}

function CommitmentForm({ onSave, onCancel }: { onSave: (commitment: Omit<LegacyCommitment, "id">) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("installment");
  const [dueDate, setDueDate] = useState(todayIso());
  const [error, setError] = useState("");

  const submit = () => {
    const value = Number(amount);
    if (!name.trim()) {
      setError("اكتب اسم الالتزام.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError("اكتب مبلغ صحيح.");
      return;
    }
    onSave({ name: name.trim(), amount: value, type, dueDate });
  };

  return (
    <Panel>
      <div className="mb-4">
        <Field label="اسم الالتزام">
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: قسط الموبايل" autoFocus />
        </Field>
      </div>
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Field label="المبلغ">
          <input className="field-input" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="النوع">
          <select className="field-input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="installment">قسط</option>
            <option value="savings_group">جمعية</option>
          </select>
        </Field>
        <Field label="تاريخ الاستحقاق">
          <input className="field-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      <FormActions onCancel={onCancel} onSubmit={submit} submitLabel="إضافة التزام" color="emerald" />
    </Panel>
  );
}

export default function FinanceScreen({ onBack }: { onBack: () => void }) {
  const {
    state,
    addTransaction,
    deleteTransaction,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    addCommitment,
    deleteCommitment,
    setMonthlySalary,
  } = useApp();
  const [tab, setTab] = useState<TabId>("transactions");
  const [showForm, setShowForm] = useState(false);
  const [salaryDraft, setSalaryDraft] = useState(String(state.monthlySalary || ""));

  const summary = calculateFinanceSummary({
    monthlySalary: state.monthlySalary,
    transactions: state.transactions,
    commitments: state.commitments,
  });

  const switchTab = (next: TabId) => {
    setTab(next);
    setShowForm(false);
  };

  const addButtonLabel = tab === "transactions" ? "معاملة جديدة" : tab === "wishlist" ? "أمنية جديدة" : "التزام جديد";

  return (
    <div dir="rtl" className="min-h-screen bg-background text-slate-100">
      <header className="glass-panel sticky top-0 z-20 flex items-center justify-between border-b border-white/10 px-5 py-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.04]">
          <ArrowLeft size={17} />
          الرئيسية
        </button>
        <div className="flex items-center gap-3">
          <Wallet size={22} className="text-emerald-300" />
          <h1 className="text-xl font-black">الماليات</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-7">
        <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="الرصيد" value={summary.balance} color={summary.balance >= 0 ? "#34d399" : "#f87171"} />
          <SummaryCard label="الدخل" value={summary.income} color="#34d399" />
          <SummaryCard label="المصروفات" value={summary.expenses} color="#f87171" />
          <SummaryCard label="الالتزامات" value={summary.commitments + summary.sadaqah} color="#a78bfa" />
        </section>

        <section className="glass-card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between">
          <Field label="الراتب الشهري">
            <input className="field-input sm:w-64" type="number" min={0} value={salaryDraft} onChange={(e) => setSalaryDraft(e.target.value)} placeholder="0" />
          </Field>
          <button type="button" onClick={() => setMonthlySalary(Number(salaryDraft) || 0)} className="rounded-lg bg-emerald-500 px-4 py-3 text-sm font-black text-slate-950 hover:bg-emerald-400">
            حفظ الراتب
          </button>
        </section>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {tabs.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => switchTab(item.id)}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-black transition ${
                  tab === item.id ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-white/10 text-slate-400 hover:bg-white/[0.04]"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-300 hover:bg-emerald-400/15">
            <Plus size={17} />
            {addButtonLabel}
          </button>
        </div>

        {showForm && tab === "transactions" && <TransactionForm onSave={(item) => { addTransaction(item); setShowForm(false); }} onCancel={() => setShowForm(false)} />}
        {showForm && tab === "wishlist" && <WishlistForm onSave={(item) => { addWishlistItem(item); setShowForm(false); }} onCancel={() => setShowForm(false)} />}
        {showForm && tab === "commitments" && <CommitmentForm onSave={(item) => { addCommitment(item); setShowForm(false); }} onCancel={() => setShowForm(false)} />}

        {tab === "transactions" && (
          <section className="grid gap-3">
            {state.transactions.length === 0 ? (
              <EmptyState title="مفيش معاملات" text="سجل أول دخل أو مصروف عشان الميزانية تبقى واضحة." icon={CreditCard} />
            ) : (
              state.transactions.map((item) => (
                <article key={item.id} className="glass-card flex items-center gap-3 p-4">
                  <div className={`grid h-10 w-10 place-items-center rounded-lg ${item.type === "income" ? "bg-emerald-400/10 text-emerald-300" : item.type === "sadaqah" ? "bg-violet-400/10 text-violet-300" : "bg-red-400/10 text-red-300"}`}>
                    {item.type === "income" ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-black">{item.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{item.category} · {item.date}</p>
                  </div>
                  <div className={`font-mono text-sm font-black ${item.type === "income" ? "text-emerald-300" : "text-red-300"}`}>
                    {item.type === "income" ? "+" : "-"}{item.amount.toLocaleString()}
                  </div>
                  <button type="button" onClick={() => deleteTransaction(item.id)} className="rounded-lg p-2 text-red-300/70 hover:bg-red-400/10">
                    <Trash2 size={16} />
                  </button>
                </article>
              ))
            )}
          </section>
        )}

        {tab === "wishlist" && (
          <section className="grid gap-3">
            {state.wishlist.length === 0 ? (
              <EmptyState title="مفيش أمنيات" text="ضيف هدف شراء وتابع المبلغ المدخر." icon={ShoppingBag} />
            ) : (
              state.wishlist.map((item) => {
                const progress = wishlistProgress(item);
                return (
                  <article key={item.id} className="glass-card p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black">{item.name}</h3>
                        <p className="mt-1 text-sm text-slate-400">{item.savedAmount.toLocaleString()} / {item.price.toLocaleString()} · أولوية {priorityLabel(item.priority)}</p>
                      </div>
                      <button type="button" onClick={() => deleteWishlistItem(item.id)} className="rounded-lg p-2 text-red-300/70 hover:bg-red-400/10">
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <Progress value={progress} color="#34d399" />
                    <div className="mt-4 flex justify-between gap-2">
                      <span className="text-sm text-slate-400">{progress}%</span>
                      <div className="flex gap-2">
                        <SmallButton onClick={() => updateWishlistItem(item.id, { savedAmount: normalizeSavingsAmount(item, -100) })}>-100</SmallButton>
                        <SmallButton onClick={() => updateWishlistItem(item.id, { savedAmount: normalizeSavingsAmount(item, 100) })}>+100</SmallButton>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        )}

        {tab === "commitments" && (
          <section className="grid gap-3">
            {state.commitments.length === 0 ? (
              <EmptyState title="مفيش التزامات" text="ضيف الأقساط أو الجمعيات عشان تظهر في الميزانية." icon={PiggyBank} />
            ) : (
              state.commitments.map((item) => (
                <article key={item.id} className="glass-card flex items-center gap-3 p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-400/10 text-violet-300">
                    <PiggyBank size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-black">{item.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">{item.type === "installment" ? "قسط" : "جمعية"} · {item.dueDate}</p>
                  </div>
                  <div className="font-mono text-sm font-black text-red-300">{item.amount.toLocaleString()}</div>
                  <button type="button" onClick={() => deleteCommitment(item.id)} className="rounded-lg p-2 text-red-300/70 hover:bg-red-400/10">
                    <Trash2 size={16} />
                  </button>
                </article>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="glass-card mb-5 p-5">{children}</div>;
}

function ErrorBox({ children }: { children: ReactNode }) {
  return <div className="mb-4 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300">{children}</div>;
}

function FormActions({ onCancel, onSubmit, submitLabel }: { onCancel: () => void; onSubmit: () => void; submitLabel: string; color: "emerald" }) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 hover:bg-white/[0.04]">
        إلغاء
      </button>
      <button type="button" onClick={onSubmit} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-black text-slate-950 hover:bg-emerald-400">
        <Plus size={16} />
        {submitLabel}
      </button>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="mb-1 text-xs font-bold text-slate-500">{label}</div>
      <div className="font-mono text-xl font-black" style={{ color }}>{value.toLocaleString()}</div>
    </div>
  );
}

function EmptyState({ title, text, icon: Icon }: { title: string; text: string; icon: ElementType }) {
  return (
    <div className="glass-card grid min-h-[230px] place-items-center p-8 text-center">
      <div>
        <Icon className="mx-auto mb-4 text-emerald-300" size={40} />
        <h2 className="text-xl font-black">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function Progress({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </div>
  );
}

function SmallButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-black text-slate-300 hover:bg-white/[0.04]">
      {children}
    </button>
  );
}

function priorityLabel(priority: LegacyWishlistItem["priority"]) {
  if (priority === "high") return "عالية";
  if (priority === "low") return "منخفضة";
  return "متوسطة";
}
