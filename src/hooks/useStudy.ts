import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';

export function useStudy() {
  const { state, addSubject, updateSubject, deleteSubject } = useApp();
  const subjects = state.subjects || [];

  const nextExam = subjects
    .filter(s => new Date(s.examDate) >= new Date())
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())[0] || null;

  const dangerSubjects = subjects.filter(s => {
    const daysLeft = Math.ceil((new Date(s.examDate).getTime() - Date.now()) / 86400000);
    const lecturesLeft = s.totalLectures - s.completedLectures;
    return daysLeft > 0 && daysLeft < 7 && lecturesLeft > 0;
  });

  return { subjects, nextExam, dangerSubjects, addSubject, updateSubject, deleteSubject };
}
