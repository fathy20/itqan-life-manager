import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

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
  console.log(`\n📦 Migrating user: ${uid}`);

  // 1. Add subscription doc if missing
  const subRef = doc(db, "users", uid, "meta", "subscription");
  const subSnap = await getDoc(subRef);
  if (!subSnap.exists()) {
    await setDoc(subRef, { planType: "free", status: "active", createdAt: now });
    console.log("  ✅ Added subscription doc (free plan)");
  } else {
    console.log("  ⏭️  Subscription doc already exists");
  }

  // 2. Add usage doc if missing
  const usageRef = doc(db, "users", uid, "meta", "usage");
  const usageSnap = await getDoc(usageRef);
  if (!usageSnap.exists()) {
    await setDoc(usageRef, { aiRequestsToday: 0, resetDate: today, updatedAt: now });
    console.log("  ✅ Added usage doc");
  } else {
    console.log("  ⏭️  Usage doc already exists");
  }

  // 3. Add createdAt/updatedAt to subcollections that lack them
  const subcollections = ["subjects", "tasks", "projects", "courses", "transactions", "wishlist", "commitments", "habits"];
  for (const col of subcollections) {
    const snap = await getDocs(collection(db, "users", uid, col));
    let updated = 0;
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      if (!data.createdAt || !data.updatedAt) {
        await setDoc(doc(db, "users", uid, col, docSnap.id), {
          ...data,
          createdAt: data.createdAt || now,
          updatedAt: data.updatedAt || now,
        });
        updated++;
      }
    }
    if (updated > 0) console.log(`  ✅ Updated ${updated} docs in ${col}`);
  }
}

async function run() {
  console.log("🚀 Starting Itqan v2 migration...\n");

  // Get all users
  const usersSnap = await getDocs(collection(db, "users"));
  console.log(`Found ${usersSnap.docs.length} users`);

  for (const userDoc of usersSnap.docs) {
    await migrateUser(userDoc.id);
  }

  console.log("\n✅ Migration complete!");
  process.exit(0);
}

run().catch(err => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
