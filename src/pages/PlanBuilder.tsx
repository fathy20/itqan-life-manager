import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppState, Subject, Task, Project, Course, Transaction, Habit } from '../types';
import { motion } from 'motion/react';
import { Upload, Check, AlertCircle, Info } from 'lucide-react';

export default function PlanBuilder() {
  const { resetState, state } = useApp();
  const [importText, setImportText] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const parseData = () => {
    try {
      const lines = importText.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
      
      const newState: AppState = JSON.parse(JSON.stringify(state)); // Deep clone current state as base

      lines.forEach(line => {
        const parts = line.split('|').map(p => p.trim());
        const type = parts[0].toLowerCase();

        switch (type) {
          case 'profile':
            if (parts[1] && parts[2]) {
              (newState.profile as any)[parts[1]] = parts[2];
            }
            break;
          case 'subject':
            // subject | name | examDate | startTime | endTime | totalLectures | completedLectures | difficulty | color | carryover
            const [_, name, examDate, start, end, total, completed, diff, color, carry] = parts;
            newState.subjects.push({
              id: Math.random().toString(36).substr(2, 9),
              name,
              examDate,
              examTime: start && end ? { start, end } : undefined,
              totalLectures: parseInt(total) || 0,
              completedLectures: parseInt(completed) || 0,
              difficulty: (diff as any) || 'medium',
              color: color || '#3b82f6',
              carryover: carry === 'true',
              isPending: carry === 'true'
            });
            break;
          case 'task':
            // task | title | type | priority | status | deadline | dueDate | estimatedMinutes | focusType
            const [__, title, tType, priority, tStatus, deadline, dueDate, est, focus] = parts;
            newState.tasks.push({
              id: Math.random().toString(36).substr(2, 9),
              title,
              type: (tType as any) || 'personal',
              priority: (priority as any) || 'medium',
              status: (tStatus as any) || 'todo',
              deadline,
              dueDate,
              estimatedMinutes: parseInt(est) || 0,
              focusType: (focus as any) || 'medium'
            });
            break;
          case 'project':
            // project | name | type | priority | status | color
            const [___, pName, pType, pPriority, pStatus, pColor] = parts;
            newState.projects.push({
              id: Math.random().toString(36).substr(2, 9),
              name: pName,
              type: (pType as any) || 'work',
              priority: (pPriority as any) || 'medium',
              status: (pStatus as any) || 'ongoing',
              color: pColor || '#3b82f6'
            });
            break;
          case 'course':
            // course | name | platform | totalHours | completedHours | weeklyGoalHours | color
            const [____, cName, platform, cTotal, cComp, cGoal, cColor] = parts;
            newState.courses.push({
              id: Math.random().toString(36).substr(2, 9),
              name: cName,
              platform,
              totalHours: parseInt(cTotal) || 0,
              completedHours: parseInt(cComp) || 0,
              weeklyGoalHours: parseInt(cGoal) || 0,
              color: cColor || '#3b82f6'
            });
            break;
          case 'habit':
            // habit | name | icon | category | frequency
            const [_____, hName, icon, hCat, freq] = parts;
            newState.habits.push({
              id: Math.random().toString(36).substr(2, 9),
              name: hName,
              icon,
              category: (hCat as any) || 'personal',
              frequency: (freq as any) || 'daily',
              streak: 0,
              completedDates: []
            });
            break;
        }
      });

      resetState(newState);
      setStatus('success');
      setImportText('');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage('حدث خطأ أثناء معالجة البيانات. تأكد من التنسيق الصحيح.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">مخطط النظام الذكي</h1>
        <p className="text-zinc-400">استورد بياناتك دفعة واحدة لبناء نظام حياتك المتكامل.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-500" />
                استيراد البيانات
              </h2>
              <button
                onClick={parseData}
                disabled={!importText.trim()}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center gap-2"
              >
                {status === 'success' ? <Check className="w-4 h-4" /> : null}
                {status === 'success' ? 'تم الاستيراد' : 'معالجة البيانات'}
              </button>
            </div>

            <textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                setStatus('idle');
              }}
              placeholder="الصق البيانات هنا بالتنسيق المطلوب...&#10;مثال:&#10;profile | name | FATHY&#10;subject | SET321 | 2026-03-28 | 14:15 | 15:15 | 14 | 5 | hard | #ef4444"
              className="w-full h-[400px] bg-black/40 border border-zinc-800 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
              dir="ltr"
            />

            {status === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-500">
                <Check className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">تم تحديث بيانات النظام بنجاح!</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              تعليمات التنسيق
            </h3>
            <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
              <p>استخدم الرمز <code className="text-zinc-200">|</code> للفصل بين القيم في كل سطر.</p>
              
              <div className="space-y-2">
                <p className="text-zinc-200 font-medium">البروفايل:</p>
                <code className="block bg-black/40 p-2 rounded border border-zinc-800 text-xs">
                  profile | key | value
                </code>
              </div>

              <div className="space-y-2">
                <p className="text-zinc-200 font-medium">المواد الدراسية:</p>
                <code className="block bg-black/40 p-2 rounded border border-zinc-800 text-xs">
                  subject | name | date | start | end | lectures | done | diff | color
                </code>
              </div>

              <div className="space-y-2">
                <p className="text-zinc-200 font-medium">المهام:</p>
                <code className="block bg-black/40 p-2 rounded border border-zinc-800 text-xs">
                  task | title | type | priority | status | deadline | dueDate | mins | focus
                </code>
              </div>

              <div className="space-y-2">
                <p className="text-zinc-200 font-medium">المشاريع:</p>
                <code className="block bg-black/40 p-2 rounded border border-zinc-800 text-xs">
                  project | name | type | priority | status | color
                </code>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
            <p className="text-sm text-emerald-500/80 italic">
              "النظام سيتعرف تلقائيًا على البيانات ويقوم بتحديث التقويم، قائمة المهام، ونظام المذاكرة فورًا."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
