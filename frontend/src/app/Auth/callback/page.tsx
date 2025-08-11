"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/api/keycloak/KeycloakProvider";

export default function CallbackPage() {
  const router = useRouter();
  const { handleCallback } = useAuth(); // Stel dat je provider zo'n functie heeft

  useEffect(() => {
    async function processLogin() {
      //await handleCallback(); // verwerk code+state uit de URL
      router.replace("/"); // schone redirect
    }
    processLogin();
  }, [router, handleCallback]);

  return <p>Even geduld, je wordt ingelogd...</p>;
}
