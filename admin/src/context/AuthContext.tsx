import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import axiosInstance from "../Api/axios";

interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  countryCode: string;
  userType: string;
  isAgency: boolean;
  agencyName: string;
  agencyNumber: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      axiosInstance
        .post(
          "/verifyToken",
          { token: storedToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          const userData = res.data.user;
          setUser(userData);
        })
        .catch(() => {
          logout(); // Invalid token
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    localStorage.setItem("token", token); // ✅ Only storing token
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
