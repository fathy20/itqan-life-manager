// ═══════════════════════════════════════════════════════════════
//  src/lib/api/intelligence.ts
//  Intelligence dashboard API module
// ═══════════════════════════════════════════════════════════════

import { apiNew } from './core';

export interface ExamRisk {
  name:      string;
  risk:      'safe' | 'warning' | 'danger';
  daysLeft:  number;
  dailyLoad: number;
}

export interface HabitEntry {
  name:    string;
  rate7d:  number;
  streak:  number;
}

export interface TopPriority {
  type:    string;
  title:   string;
  urgency: number;
  action:  string;
}

export interface IntelligenceReport {
  lifeScore:        number;
  burnout:          { level: 'low' | 'medium' | 'high'; signals: string[] };
  examRisks:        ExamRisk[];
  financeRisk:      { score: number; alerts: string[] };
  habitConsistency: { overall: number; habits: HabitEntry[] };
  topPriorities:    TopPriority[];
}

export const intelligenceApiNew = {
  getDashboard: () =>
    apiNew.get<IntelligenceReport>('/api/v1/intelligence/dashboard'),
};
