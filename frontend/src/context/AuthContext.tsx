import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { createContext, useContext } from "react";

import { auth } from "../config/firebaseClient";
import { UserAPI } from "../services/Auth/api";
import { type UserRead } from "../services/Auth/types";

export function useStateAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserRead | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    const unSubscribe = onAuthStateChanged(auth, (fbUser) => {
      async function handleUser() {
        if (!active) return;

        setLoading(true);

        if (fbUser) {
          setUser(fbUser);

          try {
            const data = await UserAPI.getUser(fbUser);
            if (!active) return;
            setUserData(data);
          } catch (error) {
            if (!active) return;
            console.error("Error fetching user data:", error);
            setUser(null);
            setUserData(null);
          } finally {
            if (active) {
              setLoading(false);
            }
          }
        } else {
          console.log("No User Logged In");
          setUser(null);
          setUserData(null);
          setLoading(false);
        }
      }

      void handleUser();
    });

    return () => {
      active = false;
      unSubscribe();
    };
  }, []);

  return { user, userData, loading };
}

type AuthContextType = {
  user: User | null;
  userData: UserRead | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useStateAuth();

  const logout = async () => {
    await auth.signOut();
    window.location.reload();
  };
  return (
    <AuthContext.Provider value={{ user, loading, logout, userData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
