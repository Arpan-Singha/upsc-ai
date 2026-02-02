import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export async function fetchAPI(endpoint, options = {}) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include' // Backend Auth (Cookies)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

export const api = {
    getNews: (date) => fetchAPI(`/current-affairs${date ? `?date=${date}` : ''}`), // Removed trailing slash handling if needed, but keeping simple
    getLibrary: () => fetchAPI('/library/'),
    getMCQs: () => fetchAPI('/practice/mcq'),
    getTests: () => fetchAPI('/practice/tests'),
    submitAnswer: (data) => fetchAPI('/mains/submit', { method: 'POST', body: JSON.stringify(data) }),

    // Backend Auth
    getMe: () => fetchAPI('/auth/me'),
    logout: () => fetchAPI('/auth/logout', { method: 'POST' }),

    // PYQ & Test Taker
    getPYQPapers: () => fetchAPI('/practice/pyqs'),
    getPaperQuestions: (id) => fetchAPI(`/practice/pyqs/${id}`),
    submitTest: (data) => fetchAPI('/practice/submit', { method: 'POST', body: JSON.stringify(data) }),

    // Chat
    sendChat: (message, history) => fetchAPI('/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),


    // Library
    getLibraryTopics: () => fetchAPI('/library/topics'),
    getLibraryContent: (topicId) => fetchAPI(`/library/content/${topicId}`),

    // Content Creation
    saveNews: (data) => fetchAPI('/current-affairs/', { method: 'POST', body: JSON.stringify(data) }),
    generateStory: (data) => fetchAPI('/current-affairs/story', { method: 'POST', body: JSON.stringify(data) }),

    // Advanced Practice
    getPracticeTopics: (subject) => fetchAPI('/practice/topics', { method: 'POST', body: JSON.stringify({ subject }) }),
    getPracticeTopics: (subject) => fetchAPI('/practice/topics', { method: 'POST', body: JSON.stringify({ subject }) }),
    generatePracticeQuestions: (topic, mode) => fetchAPI('/practice/generate', { method: 'POST', body: JSON.stringify({ topic, mode }) }),
    getPracticeStats: () => fetchAPI('/practice/stats'),

    // Article Reader Enhancements
    getArticle: (id) => fetchAPI(`/current-affairs/${id}`),
    getArticleMCQs: (id) => fetchAPI(`/current-affairs/${id}/mcq`),
    submitArticleAttempt: (articleId, data) => fetchAPI(`/current-affairs/${articleId}/attempt`, { method: 'POST', body: JSON.stringify(data) }),
    getLeaderboard: () => fetchAPI('/current-affairs/leaderboard/global'),
    getUserStats: (userId) => fetchAPI(`/current-affairs/stats?userId=${userId}`),
    getArticleAnalysis: (id) => fetchAPI(`/current-affairs/${id}/analysis`, { method: 'POST' }),

    // Generic
    custom: (endpoint, method = 'GET', body = null) => fetchAPI(endpoint, { method, body: body ? JSON.stringify(body) : undefined }),
};
