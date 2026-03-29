import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPqALy-0xsRRkiptJS-HvkHIWjMZPPOL8",
  authDomain: "add-project-3a441.firebaseapp.com",
  projectId: "add-project-3a441",
  storageBucket: "add-project-3a441.firebasestorage.app",
  messagingSenderId: "332139397275",
  appId: "1:332139397275:web:22938e4860dd4ddc1b863e",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
