import { getUser } from "@apis/index";
import { IUser } from "@typings/types";
import React, { useCallback } from "react";

const AuthContext = React.createContext<{
  user: IUser | null;
  isLoading: boolean;
}>({
  user: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [user, setUser] = React.useState<IUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const getAuthedUser = useCallback(async () => {
    setIsLoading(true);
    console.log("getAuthedUser");
    try {
      const res = await getUser();
      if (res) {
        setUser(res);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      console.log("Done");
    }
  }, []);

  React.useEffect(() => {
    getAuthedUser();
  }, [getAuthedUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
