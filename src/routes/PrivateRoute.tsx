import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../firebase';

// const PrivateRoute: React.FC<{ children?: React.ReactElement }> = ({ children }) => {
const PrivateRoute = () => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitialized(true);
    });

    return unsubscribe;
  }, []);

  if (!initialized) {
    return <div className="p-4 text-center">Checking authentication...</div>;
  }

  // For nested routes using Outlet
//   if (children) {
//     return user ? children : <Navigate to="/login" replace />;
//   }

  // For route-based protection (recommended)
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
