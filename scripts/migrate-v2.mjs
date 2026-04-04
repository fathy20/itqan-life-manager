import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPqALy-0xsRRkiptJS-HvkHIWjMZPPOL8",
  authDomain: "add-project-3a441.firebaseapp.com",
  projectId: "add-project-3a441",
  storageBucket: "add-project-3a441.firebasestorage.app",
  messagingSenderId: "332139397275",
  appId: "1:332139397275:web:22938e4860dd4ddc1b863e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const now = new Date().toISOString();
const today = now.split("T")[0];

async function migrateUser(uid) {
  console.log(`\n📦 Migrating: ${uid}`);

  // 1. Subscription doc
  const subRef = doc(db, "users", uid, "meta", "subscription");
  if (!(await getDoc(subRef)).exists()) {
    await setDoc(subRef, { planType: "free", status: "active", createdAt: now });
    console.log("  ✅ subscription doc added");
  }

  // 2. Usage doc
  const usageRef = doc(db, "users", uid, "meta", "usage");
  if (!(await getDoc(usageRef)).exists()) {
    await setDoc(usageRef, { aiRequestsToday: 0, resetDate: today, updatedAt: now });
    console.log("  ✅ usage doc added");
  }

  // 3. Add timestamps to subcollections
  const cols = ["subjects", "tasks", "projects", "courses", "transactions", "habits"];
  for (const col of cols) {
    const snap = await getDocs(collection(db, "users", uid, col));
    let updated = 0;
    for (const d of snap.docs) {
      const data = d.data();
      if (!data.createdAt || !data.updatedAt) {
        await setDoc(doc(db, "users", uid, col, d.id), { ...data, createdAt: data.createdAt || now, updatedAt: data.updatedAt || now });
        updated++;
      }
    }
    if (updated > 0) console.log(`  ✅ ${col}: ${updated} docs updated`);
  }
}

async function run() {
  console.log("🚀 Starting migration...");
  const snap = await getDocs(collection(db, "users"));
  console.log(`Found ${snap.size} users`);
  for (const d of snap.docs) await migrateUser(d.id);
  console.log("\n✅ Migration complete!");
  process.exit(0);
}

run().catch(e => { console.error("❌", e); process.exit(1); });
