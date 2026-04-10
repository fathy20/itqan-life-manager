import { useState, useEffect, useCallback } from 'react';
import { halaqahApiNew } from '../lib/api/index';
import type {
  HalaqahSummary,
  HalaqahLeaderboardEntry,
  HalaqahChallenge,
  DuaRequest,
} from '../types/new';

export interface UseHalaqahReturn {
  halaqahs:    HalaqahSummary[];
  leaderboard: HalaqahLeaderboardEntry[];
  duas:        DuaRequest[];
  challenge:   HalaqahChallenge | null;
  loading:     boolean;
  error:       string | null;

  createHalaqah:     (name: string) => Promise<void>;
  joinHalaqah:       (inviteCode: string) => Promise<void>;
  leaveHalaqah:      (id: string) => Promise<void>;
  addDua:            (id: string, text: string) => Promise<void>;
  prayForDua:        (id: string, duaId: string) => Promise<void>;
  sendNaseeha:       (id: string, text: string) => Promise<void>;
  completeChallenge: (id: string, challengeId: string) => Promise<void>;
  loadDetails:       (id: string) => Promise<void>;
  refetch:           () => Promise<void>;
}

export function useHalaqahNew(): UseHalaqahReturn {
  const [halaqahs,    setHalaqahs]    = useState<HalaqahSummary[]>([]);
  const [leaderboard, setLeaderboard] = useState<HalaqahLeaderboardEntry[]>([]);
  const [duas,        setDuas]        = useState<DuaRequest[]>([]);
  const [challenge,   setChallenge]   = useState<HalaqahChallenge | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const loadDetails = useCallback(async (halaqahId: string) => {
    try {
      const [lbRes, duasRes, challengeRes] = await Promise.all([
        halaqahApiNew.getLeaderboard(halaqahId),
        halaqahApiNew.getDuas(halaqahId),
        halaqahApiNew.getChallenge(halaqahId),
      ]);
      if (lbRes.success && lbRes.data) setLeaderboard(lbRes.data);
      if (duasRes.success && duasRes.data) setDuas(duasRes.data);
      if (challengeRes.success) setChallenge(challengeRes.data ?? null);
    } catch {
      // keep previous data; caller will surface errors
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const listRes = await halaqahApiNew.getAll();
      if (listRes.success && listRes.data) {
        setHalaqahs(listRes.data);
        const firstId = listRes.data[0]?.id;
        if (firstId) await loadDetails(firstId);
      } else if (!listRes.success) {
        console.warn('Backend unavailable — Halaqah in offline mode');
      }
    } catch {
      setError('حدث خطأ غير متوقع. أعد المحاولة.');
    } finally {
      setLoading(false);
    }
  }, [loadDetails]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createHalaqah = async (name: string) => {
    const res = await halaqahApiNew.create(name);
    if (res.success) await fetchAll();
  };

  const joinHalaqah = async (inviteCode: string) => {
    const res = await halaqahApiNew.join(inviteCode);
    if (res.success) await fetchAll();
  };

  const leaveHalaqah = async (id: string) => {
    const res = await halaqahApiNew.leave(id);
    if (res.success) await fetchAll();
  };

  const addDua = async (id: string, text: string) => {
    const res = await halaqahApiNew.addDua(id, text);
    if (res.success && res.data) {
      setDuas(prev => [res.data, ...prev]);
    }
  };

  const prayForDua = async (id: string, duaId: string) => {
    const res = await halaqahApiNew.prayForDua(id, duaId);
    if (res.success) {
      setDuas(prev => prev.map(d => d.id === duaId ? { ...d, duaCount: d.duaCount + 1 } : d));
    }
  };

  const sendNaseeha = async (id: string, text: string) => {
    await halaqahApiNew.sendNaseeha(id, text);
  };

  const completeChallenge = async (id: string, challengeId: string) => {
    const res = await halaqahApiNew.completeChallenge(id, challengeId);
    if (res.success) await fetchAll();
  };

  return {
    halaqahs, leaderboard, duas, challenge,
    loading, error,
    createHalaqah, joinHalaqah, leaveHalaqah,
    addDua, prayForDua, sendNaseeha, completeChallenge,
    loadDetails,
    refetch: fetchAll,
  };
}
