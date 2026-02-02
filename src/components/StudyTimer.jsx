import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';

const HEARTBEAT_INTERVAL = 60 * 1000; // 1 minute

export default function StudyTimer() {
    const location = useLocation();
    const intervalRef = useRef(null);

    useEffect(() => {
        // Start Timer
        intervalRef.current = setInterval(() => {
            logTime();
        }, HEARTBEAT_INTERVAL);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []); // Run once on mount

    const logTime = async () => {
        // Don't log if tab is hidden
        if (document.hidden) return;

        try {
            await api.custom('/current-affairs/log-time', 'POST', {
                userId: 'guest', // Replace with real user ID from context later
                duration: 60, // 60 seconds
                page: window.location.pathname
            });
            console.log("Logged 1 min study time");
        } catch (error) {
            console.error("Failed to log time", error);
        }
    };

    return null; // Invisible component
}
