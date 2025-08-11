"use client";

import { useEffect, useState, createContext, useContext } from "react";
import Keycloak from "keycloak-js";

const AuthContext = createContext<any>(null);

const keycloak = new Keycloak({
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL!,
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT!
});

export function KeycloakProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    keycloak
      .init({
        onLoad: "check-sso",
        pkceMethod: "S256",
        checkLoginIframe: false
      })
      .then(auth => {
        setAuthenticated(auth);
        setLoading(false);
      })
      .catch(err => {
        console.error("Keycloak init error:", err);
        //alert(JSON.stringify(err, null, 2)); // laat volledige object zien
        setLoading(false);
      });
  }, []);


  if (loading) return <p>Loading...</p>;

  return (
    <AuthContext.Provider value={{ keycloak, authenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
