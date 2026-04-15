/**
 * StudyScreen — Subjects & Exam tracking
 * Connected to: subjectsApiNew
 */
import { useState, useEffect, useCallback } from "react";
import {
  GraduationCap, ArrowLeft, Plus, BookOpen, Calendar, Trash2,
  AlertTriangle, Check, TrendingUp,
} from "lucide-react";
import { subjectsApiNew } from "../lib/api/index";
import type { Subject } from "../types/new";

const BG = "#000E30";
const CARD = "#0A1628";
const BORDER = "#0F2847";
const TEXT = "#C0C8D8";
const MUTED = "#3D5A80";
const ACCENT = "#60A5FA";

const DIFFICULTY_COLORS = ["", "#10B981", "#34D399", "#FBBF24", "#FB923C", "#F87171"];
const DIFFICULTY_LABELS = ["", "سهل جداً", "سهل", "متوسط", "صعب", "صعب جداً"];

function SubjectForm({ onSave, onCancel }: { onSave: (s: Partial<Subject>) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [difficulty, setDifficulty] = useState(3);
  const [totalLectures, setTotalLectures] = useState("");

  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="اسم المادة..."
        style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 16, color: TEXT, fontFamily: "'Noto Kufi Arabic', sans-serif", marginBottom: 14 }} />
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: MUTED, display: "block", marginBottom: 4 }}>تاريخ الامتحان</label>
          <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
            style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px", color: TEXT, fontSize: 13 }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: MUTED, display: "block", marginBottom: 4 }}>عدد المحاضرات</label>
          <input type="number" value={totalLectures} onChange={e => setTotalLectures(e.target.value)} placeholder="0"
            style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px", color: TEXT, fontSize: 13 }} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: MUTED, display: "block", marginBottom: 6 }}>الصعوبة</label>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5].map(d => (
            <button key={d} onClick={() => setDifficulty(d)} style={{
              flex: 1, padding: "6px", borderRadius: 8, fontSize: 11, cursor: "pointer",
              background: difficulty === d ? DIFFICULTY_COLORS[d] + "20" : "transparent",
              border: `1px solid ${difficulty === d ? DIFFICULTY_COLORS[d] : BORDER}`,
              color: difficulty === d ? DIFFICULTY_COLORS[d] : MUTED,
            }}>{DIFFICULTY_LABELS[d]}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, cursor: "pointer", fontSize: 13 }}>إلغاء</button>
        <button onClick={() => { if (name.trim() && examDate) onSave({ name, examDate, difficulty, totalLectures: parseInt(totalLectures) || 0, completedLectures: 0 }); }}
          style={{ padding: "8px 20px", borderRadius: 8, background: ACCENT + "20", border: `1px solid ${ACCENT}40`, color: ACCENT, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>إضافة</button>
      </div>
    </div>
  );
}

export default function StudyScreen({ onBack }: { onBack: () => void }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const res = await subjectsApiNew.list();
    if (res.success && res.data) setSubjects(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addSubject = async (data: Partial<Subject>) => {
    const res = await subjectsApiNew.create(data);
    if (res.success && res.data) { setSubjects(prev => [res.data!, ...prev]); setShowForm(false); }
  };

  const incrementLecture = async (s: Subject) => {
    if (s.completedLectures >= s.totalLectures) return;
    const res = await subjectsApiNew.update(s.id, { completedLectures: s.completedLectures + 1 });
    if (res.success) setSubjects(prev => prev.map(x => x.id === s.id ? { ...x, completedLectures: x.completedLectures + 1 } : x));
  };

  const deleteSubject = async (id: string) => {
    const res = await subjectsApiNew.delete(id);
    if (res.success) setSubjects(prev => prev.filter(x => x.id !== id));
  };

  const daysLeft = (examDate: string) => Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000));

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, background: BG, zIndex: 10 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, cursor: "pointer", fontSize: 13 }}><ArrowLeft size={16} /> الرئيسية</button>
        <div style={{ flex: 1 }} />
        <GraduationCap size={20} color={ACCENT} />
        <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>الدراسة</span>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: MUTED }}>{subjects.length} مادة</span>
          <button onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: ACCENT + "15", border: `1px solid ${ACCENT}30`, color: ACCENT, cursor: "pointer", fontSize: 13 }}><Plus size={16} /> مادة جديدة</button>
        </div>

        {showForm && <SubjectForm onSave={addSubject} onCancel={() => setShowForm(false)} />}

        {loading ? <div style={{ textAlign: "center", padding: 60, color: MUTED }}>جاري التحميل...</div> :
          subjects.map(s => {
            const progress = s.totalLectures > 0 ? Math.round((s.completedLectures / s.totalLectures) * 100) : 0;
            const days = daysLeft(s.examDate);
            const remaining = s.totalLectures - s.completedLectures;
            const dailyLoad = days > 0 ? Math.ceil(remaining / days) : remaining;
            const risk = dailyLoad > 4 ? "danger" : dailyLoad > 2 ? "warning" : "safe";

            return (
              <div key={s.id} style={{
                background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, marginBottom: 14,
                borderRight: `3px solid ${DIFFICULTY_COLORS[s.difficulty] || ACCENT}`,
                animation: "fadeIn 0.3s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{s.name}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: DIFFICULTY_COLORS[s.difficulty] + "15", color: DIFFICULTY_COLORS[s.difficulty] }}>{DIFFICULTY_LABELS[s.difficulty]}</span>
                      <span style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 4, color: MUTED }}><Calendar size={10} />{s.examDate}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {risk === "danger" && <AlertTriangle size={18} color="#F87171" />}
                    <button onClick={() => deleteSubject(s.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#F8717140" }}><Trash2 size={14} /></button>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ flex: 1, height: 8, background: BORDER, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: ACCENT, borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT, fontFamily: "'JetBrains Mono', monospace", minWidth: 40, textAlign: "center" }}>{progress}%</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: MUTED }}>{s.completedLectures}/{s.totalLectures} محاضرة · {days} يوم · {dailyLoad}/يوم</div>
                  <button onClick={() => incrementLecture(s)} disabled={s.completedLectures >= s.totalLectures}
                    style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "6px 14px",
                      borderRadius: 8, fontSize: 12, cursor: "pointer",
                      background: ACCENT + "15", border: `1px solid ${ACCENT}30`, color: ACCENT,
                      opacity: s.completedLectures >= s.totalLectures ? 0.3 : 1,
                    }}><TrendingUp size={14} /> +1</button>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}
