import { createContext, use, type PropsWithChildren } from 'react';
import { useStorageState } from './useStorageState';

const AuthContext = createContext<{
  signIn: (username: string, password: string) => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');

  return (
    <AuthContext
      value={{
        signIn: async (username: string, password: string) => {
          const validusername = 'admin';
          const validpassword = 'admin';
          if (username === validusername && password === validpassword) {
            setSession('xxx');
            return true;
          } else {
            return false;
          }
          // try {
          //   const validusername = 'admin';
          //   const validpassword = 'admin';

          //   if (username === validusername && password === validpassword) {
          //     setSession('xxx');
          //     return true;
          //   } else {
          //     return false;
          //   }
          // } catch (error) {
          //   console.error('Username atau password salah:', error);
          // }

          // Perform sign-in logic here
          // setSession('xxx');
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext>
  );
}

export default SessionProvider;
