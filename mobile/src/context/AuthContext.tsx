import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;

  signIn: (
    token: string,
    user: AuthUser
  ) => Promise<void>;

  signOut: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

type Props = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: Props) {
  const [token, setToken] =
    useState<string | null>(null);

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken =
        await AsyncStorage.getItem(
          "eventease_token"
        );

      const storedUser =
        await AsyncStorage.getItem(
          "eventease_user"
        );

      if (
        storedToken &&
        storedUser
      ) {
        const parsedUser =
          JSON.parse(storedUser);

        setToken(storedToken);

        setUser({
          id: parsedUser.id,
          name: parsedUser.name,
          email: parsedUser.email,
          isAdmin:
            parsedUser.isAdmin === true,
        });
      }
    } catch (error) {
      console.log(
        "Load auth error:",
        error
      );

      await AsyncStorage.removeItem(
        "eventease_token"
      );

      await AsyncStorage.removeItem(
        "eventease_user"
      );
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (
    newToken: string,
    newUser: AuthUser
  ) => {
    const normalizedUser: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      isAdmin:
        newUser.isAdmin === true,
    };

    await AsyncStorage.setItem(
      "eventease_token",
      newToken
    );

    await AsyncStorage.setItem(
      "eventease_user",
      JSON.stringify(
        normalizedUser
      )
    );

    setToken(newToken);
    setUser(normalizedUser);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(
      "eventease_token"
    );

    await AsyncStorage.removeItem(
      "eventease_user"
    );

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}