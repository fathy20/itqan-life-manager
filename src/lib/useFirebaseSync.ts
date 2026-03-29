import { useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { AppState } from '../types';

const COLLECTION = 'users';

export function useFirebaseSync(
  userId: string | null,
  state: AppState,
  setState: (s: AppState) => void
) {
  const initialized = useRef(false);
  const isRemoteUpdate = useRef(false);

  // Load from Firestore on first mount
  useEffect(() => {
    if (!userId) return;

    const docRef = doc(db, COLLECTION, userId);

    // First: try to load existing data
    getDoc(docRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.data() as AppState;
        isRemoteUpdate.current = true;
        setState({ ...state, ...data });
      }
      initialized.current = true;
    }).catch(console.error);

    // Real-time listener
    const unsub = onSnapshot(docRef, (snap) => {
      if (!initialized.current) return;
      if (snap.exists() && !isRemoteUpdate.current) {
        const data = snap.data() as AppState;
        isRemoteUpdate.current = true;
        setState({ ...state, ...data });
      }
      isRemoteUpdate.current = false;
    });

    return () => unsub();
  }, [userId]);

  // Save to Firestore whenever state changes
  useEffect(() => {
    if (!userId || !initialized.current) return;
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    const docRef = doc(db, COLLECTION, userId);
    setDoc(docRef, state, { merge: true }).catch(console.error);
  }, [state, userId]);
}
