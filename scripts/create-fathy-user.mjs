import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPqALy-0xsRRkiptJS-HvkHIWjMZPPOL8",
  authDomain: "add-project-3a441.firebaseapp.com",
  projectId: "add-project-3a441",
  storageBucket: "add-project-3a441.firebasestorage.app",
  messagingSenderId: "332139397275",
  appId: "1:332139397275:web:22938e4860dd4ddc1b863e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const EMAIL = "fathyahmed123456.o@gmail.com";
const PASSWORD = "fathy0";
const DISPLAY_NAME = "فتحي";

async function run() {
  try {
    // Create user
    console.log("Creating user...");
    const cred = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
    await updateProfile(cred.user, { displayName: DISPLAY_NAME });
    const uid = cred.user.uid;
    console.log("✅ User created! UID:", uid);

    // Get old data from 'فتحي' document
    const oldDoc = await getDoc(doc(db, "users", "فتحي"));
    
    if (oldDoc.exists()) {
      console.log("📦 Found old Fathy data, migrating...");
      const oldData = oldDoc.data();
      // Save under new UID
      await setDoc(doc(db, "users", uid), {
        ...oldData,
        profile: {
          ...oldData.profile,
          name: DISPLAY_NAME,
        }
      });
      console.log("✅ Data migrated to UID:", uid);
    } else {
      console.log("⚠️ No old data found, starting fresh");
    }

    console.log("\n🎉 Done! Fathy can now login with:");
    console.log("   Email:", EMAIL);
    console.log("   Password:", PASSWORD);
    process.exit(0);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log("⚠️ Email already exists! Fathy already has an account.");
      console.log("   Email:", EMAIL);
      console.log("   Password:", PASSWORD);
    } else {
      console.error("❌ Error:", err.message);
    }
    process.exit(0);
  }
}

run();
