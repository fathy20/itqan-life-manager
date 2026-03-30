import { useState, useEffect, useCallback } from 'react';
import { halaqahApi } from '../lib/api';

export function useHalaqah(halaqahId?: string) {
  const [halaqahs, setHalaqahs] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [duas, setDuas] = useState<any[]>([]);
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await halaqahApi.getAll();
      if ((res as any).success) setHalaqahs((res as any).data || []);
    } catch (_) {}
    setLoading(false);
  }, []);

  const fetchHalaqahData = useCallback(async (id: string) => {
    try {
      const [lbRes, duasRes, challengeRes] = await Promise.all([
        halaqahApi.getLeaderboard(id),
        halaqahApi.getDuas(id),
        halaqahApi.getChallenge(id),
      ]);
      if ((lbRes as any).success) setLeaderboard((lbRes as any).data || []);
      if ((duasRes as any).success) setDuas((duasRes as any).data || []);
      if ((challengeRes as any).success) setChallenge((challengeRes as any).data);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (halaqahId) fetchHalaqahData(halaqahId);
  }, [halaqahId, fetchHalaqahData]);

  const createHalaqah = async (name: string) => {
    const res = await halaqahApi.create(name);
    if ((res as any).success) await fetchAll();
    return res;
  };

  const joinHalaqah = async (inviteCode: string) => {
    const res = await halaqahApi.join(inviteCode);
    if ((res as any).success) await fetchAll();
    return res;
  };

  const leaveHalaqah = async (id: string) => {
    const res = await halaqahApi.leave(id);
    if ((res as any).success) await fetchAll();
    return res;
  };

  const addDua = async (id: string, text: string) => {
    const res = await halaqahApi.addDua(id, text);
    if ((res as any).success && halaqahId) await fetchHalaqahData(halaqahId);
    return res;
  };

  const prayForDua = async (id: string, duaId: string) => {
    const res = await halaqahApi.prayForDua(id, duaId);
    if ((res as any).success && halaqahId) await fetchHalaqahData(halaqahId);
    return res;
  };

  const sendNaseeha = async (id: string, text: string) => {
    return halaqahApi.sendNaseeha(id, text);
  };

  const completeChallenge = async (id: string, challengeId: string) => {
    const res = await halaqahApi.completeChallenge(id, challengeId);
    if ((res as any).success && halaqahId) await fetchHalaqahData(halaqahId);
    return res;
  };

  return {
    halaqahs, leaderboard, duas, challenge, loading,
    createHalaqah, joinHalaqah, leaveHalaqah,
    addDua, prayForDua, sendNaseeha, completeChallenge,
    refresh: fetchAll,
  };
}
