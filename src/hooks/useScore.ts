import { useState, useEffect } from 'react';
import { scoreApi } from '../lib/api';

export function useScore() {
  const [todayScore, setTodayScore] = useState<any>(null);
  const [weekScores, setWeekScores] = useState<any[]>([]);
  const [shared, setShared] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      scoreApi.getToday(),
      scoreApi.getWeek(),
      scoreApi.getShared(),
    ]).then(([today, week, sharedRes]) => {
      if ((today as any).success) setTodayScore((today as any).data);
      if ((week as any).success) setWeekScores((week as any).data || []);
      if ((sharedRes as any).success) setShared((sharedRes as any).data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const weekAvg = weekScores.length > 0
    ? Math.round(weekScores.reduce((a, b) => a + (b.total || 0), 0) / weekScores.length)
    : 0;

  return { todayScore, weekScores, shared, weekAvg, loading };
}
