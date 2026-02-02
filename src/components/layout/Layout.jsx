import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
    return (
        <div className="flex min-h-screen bg-gray-50/50 font-sans">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto max-w-7xl p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
