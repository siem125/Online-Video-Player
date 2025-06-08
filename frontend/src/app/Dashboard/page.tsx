"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCookie } from '@/app/Components/utils/cookieUtils';
import ToWatchList from '@/app/Components/CollectionList/ToWatchList';
import CollectionsList from '@/app/Components/CollectionList/CollectionsList';

export default function DashboardPage() {
    const [username, setUsername] = useState('');
    const [toWatchList, setToWatchList] = useState([]);
    const [collections, setCollections] = useState([]);

    useEffect(() => {
        const cookieUsername = getCookie('authToken') || 'Guest';
        setUsername(cookieUsername);

        const fetchData = async () => {
            try {
                const response = await fetch(`/api/userData?username=${cookieUsername}`);
                const data = await response.json();
                if (response.ok) {
                    setToWatchList(data.toWatch);
                    setCollections(data.collections);
                } else {
                    console.error(data.error);
                }
            } catch (error) {
                console.error("Failed to fetch user data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">Welcome, {username}!</h1>

            <h2 className="text-xl font-semibold mt-6">To Watch List</h2>
            <ToWatchList items={toWatchList} />

            <h2 className="text-xl font-semibold mt-6">Collections</h2>
            <CollectionsList collections={collections} />
        </main>
    );
}
