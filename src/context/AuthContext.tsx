import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth, db } from "../firebase";

interface UserProfile {
  id: string; // ✅ Added this line
  uid: string;
  email: string;
  displayName: string;
  fullName: string;
  username: string;
  department: string;
  facilityName?: string;
  role: string;
  group: string;
  photoURL?: string;
  createdAt?: Date;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        console.log("firebaseUser", firebaseUser);
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

        if (userDoc.exists()) {
          const userData = {
            ...(userDoc.data() as UserProfile),
            id: firebaseUser.uid, // ✅ Assign id from Firestore UID
          };

          // 🔁 Normalize roles
          if (userData.role === "System Admin") {
            userData.role = "Admin";
          } else if (userData.role === "Team Leader") {
            userData.role = "Leader";
          }

          console.log("userData", userData);
          setProfile(userData);
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile }}>
      {children}
    </AuthContext.Provider>
  );
}
