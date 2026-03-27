import type { ReactNode } from "react";
import { AuthProvider as OidcAuthProvider, useAuth } from "react-oidc-context";
import { oidcConfig } from "@/config/auth";
import { setTokenGetter } from "@/services/api";

interface AuthProviderProps {
  children: ReactNode;
}

function TokenSetter({ children }: { children: ReactNode }) {
  const auth = useAuth();

  setTokenGetter(() => auth.user?.access_token ?? null);

  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <OidcAuthProvider {...oidcConfig}>
      <TokenSetter>{children}</TokenSetter>
    </OidcAuthProvider>
  );
}
