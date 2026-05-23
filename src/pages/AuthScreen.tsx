import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../lib/firebase";
import { Eye, EyeOff, Loader2, LogIn, Mail, Sparkles, User, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/wrong-password": "كلمة السر غير صحيحة.",
  "auth/invalid-credential": "الإيميل أو كلمة السر غير صحيحين.",
  "auth/user-not-found": "الحساب ده مش موجود.",
  "auth/email-already-in-use": "الإيميل ده مستخدم قبل كده.",
  "auth/weak-password": "كلمة السر لازم تكون 6 أحرف على الأقل.",
  "auth/invalid-email": "الإيميل غير صحيح.",
  "auth/too-many-requests": "محاولات كتير. استنى شوية وجرب تاني.",
  "auth/network-request-failed": "في مشكلة في الاتصال بالإنترنت.",
};

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isRegister = mode === "register";

  const switchMode = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setErrorMsg("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (isRegister && !name.trim()) {
      setErrorMsg("اكتب اسمك الأول.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setErrorMsg("تأكيد كلمة السر غير مطابق.");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err: unknown) {
      const code = err instanceof FirebaseError ? err.code : "unknown";
      setErrorMsg(ERROR_MESSAGES[code] || "حصل خطأ. جرّب تاني.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir="rtl" className="min-h-screen bg-background px-5 py-8 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.10),transparent_32%)]" />

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-8 lg:grid-cols-[1fr_430px]">
        <section className="hidden lg:block">
          <div className="mb-6 inline-flex items-center gap-3 rounded-lg border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-bold text-sky-200">
            <Sparkles size={17} />
            إتقان
          </div>
          <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight">
            نظام واحد ينظم يومك من غير دوشة.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-slate-400">
            تابع عبادتك، دراستك، شغلك، صحتك، وتركيزك في واجهة واحدة هادئة وسريعة.
          </p>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {["متابعة يومية", "بيانات محفوظة", "واجهة عربية"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </section>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-[430px]">
          <div className="mb-6 text-center lg:hidden">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-lg border border-sky-400/25 bg-sky-400/10 text-sky-300">
              <Sparkles size={25} />
            </div>
            <h1 className="text-3xl font-black">إتقان</h1>
            <p className="mt-2 text-sm text-slate-400">نظام إدارة الحياة الذكي</p>
          </div>

          <div className="mb-4 grid grid-cols-2 rounded-lg border border-white/10 bg-white/[0.03] p-1">
            <button type="button" onClick={() => switchMode("login")} className={tabClass(!isRegister)}>
              <LogIn size={16} />
              دخول
            </button>
            <button type="button" onClick={() => switchMode("register")} className={tabClass(isRegister)}>
              <UserPlus size={16} />
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleSubmit} className="glass-card p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-black">{isRegister ? "إنشاء حساب جديد" : "تسجيل الدخول"}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {isRegister ? "اكتب بياناتك، وبعدها هنكمل إعداد الحساب خطوة بخطوة." : "ادخل بإيميلك وكلمة السر عشان تكمل من آخر مكان وقفت عنده."}
              </p>
            </div>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {isRegister && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <FieldLabel>اسمك</FieldLabel>
                    <div className="relative">
                      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: فتحي" className="field-input pr-11" />
                      <User size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <FieldLabel>الإيميل</FieldLabel>
                <div className="relative">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" className="field-input pr-11 text-left" dir="ltr" />
                  <Mail size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div>
                <FieldLabel>كلمة السر</FieldLabel>
                <PasswordInput value={password} onChange={setPassword} showPass={showPass} setShowPass={setShowPass} />
              </div>

              <AnimatePresence initial={false}>
                {isRegister && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <FieldLabel>تأكيد كلمة السر</FieldLabel>
                    <PasswordInput value={confirmPassword} onChange={setConfirmPassword} showPass={showPass} setShowPass={setShowPass} />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {errorMsg && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-center text-sm text-red-300">
                    {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-400 px-4 py-3.5 text-sm font-black text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600">
                {loading ? <Loader2 size={20} className="animate-spin" /> : isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
                {loading ? "جاري التنفيذ..." : isRegister ? "إنشاء الحساب" : "دخول"}
              </button>

              <button type="button" onClick={() => switchMode(isRegister ? "login" : "register")} className="w-full rounded-lg px-4 py-2 text-sm font-bold text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-200">
                {isRegister ? "عندك حساب؟ سجل دخول" : "معندكش حساب؟ اعمل حساب جديد"}
              </button>
            </div>
          </form>
        </motion.section>
      </div>
    </main>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-xs font-bold text-slate-400">{children}</label>;
}

function PasswordInput({
  value,
  onChange,
  showPass,
  setShowPass,
}: {
  value: string;
  onChange: (value: string) => void;
  showPass: boolean;
  setShowPass: (value: boolean) => void;
}) {
  return (
    <div className="relative">
      <input
        type={showPass ? "text" : "password"}
        required
        minLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••"
        className="field-input pl-12 text-left"
        dir="ltr"
      />
      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-200" aria-label={showPass ? "إخفاء كلمة السر" : "إظهار كلمة السر"}>
        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function tabClass(active: boolean) {
  return [
    "flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-black transition",
    active ? "bg-sky-400 text-slate-950" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
  ].join(" ");
}
