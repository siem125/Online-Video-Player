"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
//import { getCookie } from '@/Components/utils/cookieUtils';
import ToWatchList from '@/Components/CollectionList/ToWatchList';
import CollectionsList from '@/Components/CollectionList/CollectionsList';
import { useAuth } from '@/features/Providers/Keycloak/KeycloakProvider';

export default function DashboardPage() {
    const [toWatchList, setToWatchList] = useState([]);
    const [toContinueList, setToContinueList] = useState([]);
    const [collections, setCollections] = useState([]);

    const { user } = useAuth();

    useEffect(() => {
        // Old cookie method
        // const cookieUsername = getCookie('authToken') || 'Guest';
        // setUsername(cookieUsername);

        const fetchData = async () => {
            try {
                const response = await fetch(`/api/userData?userId=${user?.uniqueID}`);
                const data = await response.json();
                if (response.ok) {
                    setToWatchList(data.toWatch);
                    setToContinueList(data.toContinueList);
                    setCollections(data.collections);
                } else {
                    console.error(data.error);
                }
            } catch (error) {
                console.error("Failed to fetch user data: ", error);
            }
        };

        fetchData();
    }, []);

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">Welcome, {user?.firstName}!</h1>

            <h2 className="text-xl font-semibold mt-6">To Watch List</h2>
            <ToWatchList items={toWatchList} />

            <h2 className="text-xl font-semibold mt-6">To Continue List</h2>
            <ToWatchList items={toContinueList} />

            <h2 className="text-xl font-semibold mt-6">Collections</h2>
            <CollectionsList collections={collections} />
        </main>
    );
}
