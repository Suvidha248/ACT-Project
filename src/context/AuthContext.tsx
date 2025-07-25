import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth, db } from "../firebase";

interface UserProfile {
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
  loading: boolean;
  initialized: boolean;
  error: string | null;
  refetchProfile: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);          // ✅ Add loading state
  const [initialized, setInitialized] = useState(false); // ✅ Add initialized state
  const [error, setError] = useState<string | null>(null); // ✅ Add error state

  const normalizeRole = (role: string): string => {
    if (role === "System Admin") return "Admin";
    if (role === "Team Leader") return "Leader";
    return role;
  };

  const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      setError(null);
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        console.log("userData", userData);
        
        // Normalize roles
        userData.role = normalizeRole(userData.role);
        
        setProfile(userData);
      } else {
        setProfile(null);
        setError("User profile not found");
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to fetch user profile");
      setProfile(null);
    }
  }, []);

  const refetchProfile = useCallback(async () => {
    if (user) {
      setLoading(true);
      await fetchUserProfile(user);
      setLoading(false);
    }
  }, [user, fetchUserProfile]);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      console.log("firebaseUser", firebaseUser);
      setUser(firebaseUser);
      setError(null);

      if (firebaseUser) {
        setLoading(true);
        await fetchUserProfile(firebaseUser);
      } else {
        setProfile(null);
      }

      if (isMounted) {
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchUserProfile]);

  // ✅ Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    profile,
    loading,
    initialized,
    error,
    refetchProfile,
  }), [user, profile, loading, initialized, error, refetchProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}