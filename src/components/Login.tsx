import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "../components/Layout/Header";
import { auth, db } from "../firebase";
import LoadingSpinner from "../LoadingSpinner";

// Define proper types for form data
interface FormData {
  email: string;
  password: string;
  fullName: string;
  username: string;
  department: string;
  role: string;
  group: string;
  facilityName: string;
}

// Options from your user dataset
const departmentOptions = [
  "Admin",
  "Leadership", 
  "Maintenance",
  "Operations",
  "Safety",
  "Support",
];

const roleOptions = [
  "Facility Support",
  "Floor Supervisor",
  "IT Support", 
  "Operator",
  "Ops Manager",
  "Plant Head",
  "Safety Officer",
  "Supervisor",
  "System Admin",
  "Technician",
];

const groupOptions = [
  "GRP_Facility_Support",
  "GRP_Floor_Supervisor",
  "GRP_IT_Support",
  "GRP_Operator", 
  "GRP_Ops_Manager",
  "GRP_Plant_Head",
  "GRP_Safety_Officer",
  "GRP_Supervisor",
  "GRP_System_Admin",
  "GRP_Technician",
];

const facilityOptions = ["Atlanta", "Novi"];

const initialForm: FormData = {
  email: "",
  password: "",
  fullName: "",
  username: "",
  department: "",
  role: "",
  group: "",
  // facilityName: "Atlanta",
  facilityName: "",
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState<FormData>(initialForm);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setAuthChecked(true);
      if (user && !isSignUp) navigate("/dashboard", { replace: true });
    });
    
    if (location.state?.message) {
      setSuccessMessage(location.state.message as string);
      window.history.replaceState({}, document.title);
    }
    return unsubscribe;
  }, [navigate, location.state, isSignUp]);

  const handleUserDocument = async (
    user: User,
    extraFields?: FormData
  ): Promise<void> => {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    // if (!userSnap.exists()) {
    //   // Determine facility based on email domain or user selection
    //   const facilityName = extraFields?.facilityName || 
    //                       (extraFields?.email?.includes('novi') ? 'Novi' : 'Atlanta');
    if (!userSnap.exists()) {
    // Determine facility - require explicit selection for signup
    let facilityName = extraFields?.facilityName;
    
    // Only use email-based logic for Google sign-in (when no extraFields)
    if (!facilityName && !extraFields) {
      facilityName = user.email?.includes('novi') ? 'Novi' : 'Atlanta';
    }
    
    // For regular signup, facilityName should be explicitly selected
    if (!facilityName) {
      throw new Error('Facility selection is required');
    } 
    
      await setDoc(userDocRef, {
        id: user.uid,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || extraFields?.fullName || "",
        fullName: extraFields?.fullName || "",
        username: extraFields?.username || user.email?.split('@')[0] || "",
        department: extraFields?.department || "",
        role: extraFields?.role || "Operator",
        group: extraFields?.group || "",
        facilityName: facilityName,
        photoURL: user.photoURL || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      });
    }
  };

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      await handleUserDocument(userCredential.user);

      const idToken = await userCredential.user.getIdToken();
      sessionStorage.setItem("idToken", idToken);

      navigate("/dashboard", { replace: true });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      if (userCredential.user && form.fullName) {
        await updateProfile(userCredential.user, {
          displayName: form.fullName,
        });
      }
      await handleUserDocument(userCredential.user, form);
      await signOut(auth);
      navigate("/login", {
        replace: true,
        state: { message: "Registration successful! Please log in." },
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = async (credentialResponse: CredentialResponse): Promise<void> => {
    if (!credentialResponse.credential) {
      alert("No credential received");
      return;
    }
    setIsLoading(true);
    try {
      const credential = GoogleAuthProvider.credential(credentialResponse.credential);
      const userCredential = await signInWithCredential(auth, credential);
      await handleUserDocument(userCredential.user);

      const idToken = await userCredential.user.getIdToken();
      sessionStorage.setItem("idToken", idToken);

      navigate("/dashboard", { replace: true });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (): void => {
    alert("Failed to authenticate with Google. Please try again.");
  };

  if (!authChecked || isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <Header isAuthPage />

      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Tab Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-full bg-gray-700">
              <button
                className={`px-6 py-2 rounded-l-full font-semibold transition ${
                  !isSignUp ? "bg-cyan-500 text-white" : "text-white"
                }`}
                onClick={() => setIsSignUp(false)}
              >
                Login
              </button>
              <button
                className={`px-6 py-2 rounded-r-full font-semibold transition ${
                  isSignUp ? "bg-cyan-500 text-white" : "text-white"
                }`}
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-600 text-white text-center rounded-lg py-2 mb-2">
              {successMessage}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-[#0f172a] p-8 rounded-2xl shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">
                {isSignUp ? "Create Account" : "Sign In"}
              </h2>
            </div>

            <form
              onSubmit={isSignUp ? handleSignUp : handleLogin}
              className="space-y-4"
            >
              {isSignUp && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded-lg text-white placeholder-gray-400"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="Username"
                    required
                    className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded-lg text-white placeholder-gray-400"
                    value={form.username}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, username: e.target.value }))
                    }
                  />
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded-lg text-white"
                    value={form.facilityName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, facilityName: e.target.value }))
                    }
                  >
                    <option value="">Select Facility</option>
                    {facilityOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded-lg text-white"
                    value={form.department}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, department: e.target.value }))
                    }
                  >
                    <option value="">Select Department</option>
                    {departmentOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded-lg text-white"
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value }))
                    }
                  >
                    <option value="">Select Role</option>
                    {roleOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded-lg text-white"
                    value={form.group}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, group: e.target.value }))
                    }
                  >
                    <option value="">Select Group</option>
                    {groupOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <input
                type="email"
                placeholder="Email"
                required
                className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded-lg text-white placeholder-gray-400"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded-lg text-white placeholder-gray-400"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />
              <button
                type="submit"
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition"
              >
                {isSignUp ? "Sign Up" : "Login"}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gray-600" />
              <span className="px-3 text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-600" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                theme="filled_black"
                shape="pill"
                size="large"
                text="signin_with"
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 font-normal">
                Secure authentication powered by Google
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
