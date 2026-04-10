import { useEffect, useMemo, useState } from "react";
import {
  Users, Trophy, Target, Flame, Heart, Send, Plus,
  RefreshCw, ArrowRight, AlertCircle, CheckCircle2
} from "lucide-react";
import { useHalaqahNew } from '../hooks/useHalaqahNew';

const BG = "#000E30";
const CARD = "#071A3A";
const BORDER = "#0C2550";
const TEXT = "#C0C8D8";
const MUTED = "#3D5A80";
const BRIGHT = "#E8EBF0";
const CYAN = "#08A7E7";
const GOLD = "#FBBF24";
const GREEN = "#34D399";
const mono = "'JetBrains Mono', monospace";
const ar = "'Noto Kufi Arabic', sans-serif";

function Card({ children, style }: any) {
  return (
    <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", ...style }}>
      {children}
    </div>
  );
}

function Badge({ label, color = CYAN }: { label: string; color?: string }) {
  return (
    <span style={{
      fontSize: 11, padding: "4px 10px", borderRadius: 999,
      background: `${color}15`, color, border: `1px solid ${color}30`, fontFamily: mono,
    }}>{label}</span>
  );
}

function Stat({ label, value, color = BRIGHT }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 11, color: MUTED }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 700, color, fontFamily: mono }}>{value}</span>
    </div>
  );
}

export default function SibaqSystem({ onBack }: { onBack?: () => void }) {
  const {
    halaqahs, leaderboard, duas, challenge, loading, error,
    createHalaqah, joinHalaqah, leaveHalaqah,
    addDua, prayForDua, sendNaseeha, completeChallenge,
    loadDetails, refetch,
  } = useHalaqahNew();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [newDua, setNewDua] = useState("");
  const [naseehaText, setNaseehaText] = useState("");

  useEffect(() => {
    if (!selectedId && halaqahs[0]) {
      setSelectedId(halaqahs[0].id);
    }
  }, [halaqahs, selectedId]);

  useEffect(() => {
    if (selectedId) loadDetails(selectedId);
  }, [selectedId, loadDetails]);

  const selectedName = useMemo(() => halaqahs.find(h => h.id === selectedId)?.name ?? "", [halaqahs, selectedId]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createHalaqah(newName.trim());
    setNewName("");
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    await joinHalaqah(inviteCode.trim());
    setInviteCode("");
  };

  const handleLeave = async (id: string) => {
    await leaveHalaqah(id);
    setSelectedId(null);
  };

  const handleAddDua = async () => {
    if (!selectedId || !newDua.trim()) return;
    await addDua(selectedId, newDua.trim());
    setNewDua("");
  };

  const handleSendNaseeha = async () => {
    if (!selectedId || !naseehaText.trim()) return;
    await sendNaseeha(selectedId, naseehaText.trim());
    setNaseehaText("");
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, padding: "24px 32px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;600;700&family=Noto+Kufi+Arabic:wght@500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {onBack && (
            <button onClick={onBack} style={{
              width: 36, height: 36, borderRadius: 10, background: BG, border: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center", color: TEXT, cursor: "pointer",
            }}>
              <ArrowRight size={16} />
            </button>
          )}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Trophy size={20} color={GOLD} />
              <span style={{ fontFamily: ar, fontSize: 22, fontWeight: 700, color: BRIGHT }}>سباق الإتقان</span>
              <span style={{ fontSize: 13, color: MUTED }}>Halaqah & Leaderboard</span>
            </div>
            <div style={{ fontSize: 12, color: MUTED }}>حلقات، تحديات، ودعاء جماعي ببيانات مباشرة</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {loading && <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} color={CYAN} />}
          <button onClick={() => refetch()} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10,
            background: BG, border: `1px solid ${BORDER}`, color: TEXT, cursor: "pointer"
          }}>
            <RefreshCw size={14} />
            <span style={{ fontSize: 12 }}>تحديث</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 10, background: "#2d1b1b", border: "1px solid #6b1d1d", color: "#fca5a5", display: "flex", gap: 8 }}>
          <AlertCircle size={16} />
          <span style={{ fontSize: 13 }}>{error}</span>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Halaqah list */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={16} color={CYAN} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>حلقاتي</span>
              </div>
              <Badge label={`${halaqahs.length} مجموعات`} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {halaqahs.map(h => (
                <div key={h.id} style={{
                  border: `1px solid ${selectedId === h.id ? `${CYAN}50` : BORDER}`,
                  background: selectedId === h.id ? `${CYAN}07` : BG,
                  borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: BRIGHT, fontFamily: ar }}>{h.name}</span>
                      {h.createdBy && <Badge label="مشرف" color={GOLD} />}
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 6, color: MUTED, fontSize: 11 }}>
                      <span>{h.memberCount} أعضاء</span>
                      <span>كود: {h.inviteCode}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setSelectedId(h.id)} style={{
                      padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "transparent", color: TEXT, cursor: "pointer"
                    }}>فتح</button>
                    <button onClick={() => handleLeave(h.id)} style={{
                      padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, cursor: "pointer"
                    }}>خروج</button>
                  </div>
                </div>
              ))}
              {!halaqahs.length && (
                <div style={{ fontSize: 12, color: MUTED }}>لا توجد حلقات بعد. أنشئ واحدة أو انضم عبر كود.</div>
              )}
            </div>
          </Card>

          {/* Create / Join */}
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 12, color: MUTED }}>إنشاء حلقة جديدة</span>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="اسم الحلقة" style={{
                  background: BG, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: 13,
                }} />
                <button onClick={handleCreate} disabled={!newName.trim()} style={{
                  padding: "10px 12px", borderRadius: 10, background: `${GREEN}20`, border: `1px solid ${GREEN}40`, color: GREEN,
                  fontWeight: 700, cursor: newName.trim() ? "pointer" : "not-allowed",
                }}>
                  <Plus size={14} style={{ marginInlineEnd: 6 }} /> إنشاء
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 12, color: MUTED }}>الانضمام عبر كود</span>
                <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="كود الدعوة" style={{
                  background: BG, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: 13,
                }} />
                <button onClick={handleJoin} disabled={!inviteCode.trim()} style={{
                  padding: "10px 12px", borderRadius: 10, background: `${CYAN}15`, border: `1px solid ${CYAN}40`, color: CYAN,
                  fontWeight: 700, cursor: inviteCode.trim() ? "pointer" : "not-allowed",
                }}>
                  <Users size={14} style={{ marginInlineEnd: 6 }} /> انضم
                </button>
              </div>
            </div>
          </Card>

          {/* Dua wall */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Heart size={15} color={GOLD} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>جدار الدعاء</span>
              </div>
              <Badge label={`${duas.length} طلب`} color={GOLD} />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input value={newDua} onChange={e => setNewDua(e.target.value)} placeholder="أضف طلب دعاء" style={{
                flex: 1, background: BG, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: 13,
              }} />
              <button onClick={handleAddDua} disabled={!selectedId || !newDua.trim()} style={{
                padding: "10px 12px", borderRadius: 10, background: `${GOLD}18`, border: `1px solid ${GOLD}35`, color: GOLD,
                fontWeight: 700, cursor: selectedId && newDua.trim() ? "pointer" : "not-allowed",
              }}>
                <Send size={14} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {duas.map(d => (
                <div key={d.id} style={{
                  padding: "10px 12px", borderRadius: 10, border: `1px solid ${BORDER}`, background: BG,
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div style={{ color: BRIGHT, fontSize: 13 }}>{d.text}</div>
                  <button onClick={() => selectedId && d.id && prayForDua(selectedId, d.id)} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8,
                    background: `${CYAN}12`, border: `1px solid ${CYAN}30`, color: CYAN, cursor: "pointer"
                  }}>
                    <Heart size={14} />
                    <span style={{ fontFamily: mono, fontSize: 12 }}>{d.duaCount}</span>
                  </button>
                </div>
              ))}
              {!duas.length && <span style={{ fontSize: 12, color: MUTED }}>لا توجد أدعية بعد.</span>}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Leaderboard */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Trophy size={16} color={GOLD} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>لوحة الصدارة</span>
              </div>
              <Badge label={selectedName || '—'} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {leaderboard.map((m, idx) => (
                <div key={`${m.displayName}-${idx}`} style={{
                  padding: "10px 12px", borderRadius: 10, border: `1px solid ${BORDER}`, background: BG,
                  display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "center"
                }}>
                  <div>
                    <div style={{ fontSize: 14, color: BRIGHT, fontWeight: 700 }}>{m.displayName}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>{m.rankTitle}</div>
                  </div>
                  <Stat label="حلقة الأسبوع" value={`${m.weeklyRingPercent}%`} color={CYAN} />
                  <Stat label="سلسلة" value={`${m.streakDays}d`} color={GREEN} />
                </div>
              ))}
              {!leaderboard.length && <span style={{ fontSize: 12, color: MUTED }}>لا بيانات بعد.</span>}
            </div>
          </Card>

          {/* Challenge */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Target size={16} color={CYAN} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>التحدي النشط</span>
              {challenge && <Badge label={challenge.type} color={CYAN} />}
            </div>
            {challenge ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontFamily: ar, fontSize: 15, color: BRIGHT }}>{challenge.descriptionAr || challenge.description}</div>
                <div style={{ fontSize: 12, color: MUTED }}>من {challenge.startDate} إلى {challenge.endDate}</div>
                <button onClick={() => selectedId && completeChallenge(selectedId, challenge.id)} style={{
                  alignSelf: "flex-start", padding: "10px 12px", borderRadius: 10,
                  background: `${GREEN}18`, border: `1px solid ${GREEN}35`, color: GREEN,
                  fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                }}>
                  <CheckCircle2 size={16} /> إتمام التحدي
                </button>
              </div>
            ) : (
              <span style={{ fontSize: 12, color: MUTED }}>لا يوجد تحدي حالي.</span>
            )}
          </Card>

          {/* Naseeha */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Flame size={16} color={GOLD} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>نصيحة</span>
            </div>
            <textarea value={naseehaText} onChange={e => setNaseehaText(e.target.value)} rows={3} placeholder="اكتب نصيحة أو تذكير لإخوتك" style={{
              width: "100%", background: BG, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 10,
              padding: "10px 12px", fontSize: 13, resize: "vertical", minHeight: 80,
            }} />
            <button onClick={handleSendNaseeha} disabled={!selectedId || !naseehaText.trim()} style={{
              marginTop: 10, padding: "10px 12px", borderRadius: 10, background: `${CYAN}15`, border: `1px solid ${CYAN}35`, color: CYAN,
              fontWeight: 700, cursor: selectedId && naseehaText.trim() ? "pointer" : "not-allowed",
            }}>
              <Send size={14} style={{ marginInlineEnd: 6 }} /> إرسال
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
