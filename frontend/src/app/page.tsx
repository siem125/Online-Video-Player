"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../features/Providers/Keycloak/KeycloakProvider";

export default function HomePage() {
    const { authenticated,  keycloak } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (authenticated) {
            router.replace("/Dashboard");  // Als ingelogd, direct naar dashboard
        }
    }, [authenticated, router]);

    const handleLogin = () => {
        keycloak.login({
        // redirectUri: "http://localhost:3000/auth/callback", // callback page
        });
    };

    return (
        <div>
            <h1>Welkom op de site!!!</h1>
            <p>Je moet inloggen om verder te gaan.</p>
            
            <button
                onClick={handleLogin}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
            >
                Inloggen
            </button>
        </div>
    );
}
