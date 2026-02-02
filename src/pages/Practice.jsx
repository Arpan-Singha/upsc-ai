import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import ClassTests from './ClassTests';
import MCQPractice from './MCQPractice';

export default function Practice() {
    const location = useLocation();

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-4 border-b border-gray-200 pb-4 overflow-x-auto">
                <NavLink to="/practice/prelims" label="MCQ Practice" current={location.pathname} />
                <NavLink to="/practice/pyqs" label="Previous Year Questions" current={location.pathname} />
                <NavLink to="/practice/tests" label="My Tests" current={location.pathname} />
            </header>

            <Routes>
                <Route path="prelims" element={<MCQPractice />} />
                <Route path="pyqs" element={<PYQSection />} />
                <Route path="tests" element={<TestSection />} />
                <Route path="test/:testId" element={<MCQPractice />} />
            </Routes>
        </div>
    );
}

function NavLink({ to, label, current }) {
    const isActive = current.includes(to);
    return (
        <Link to={to} className={cn("text-lg font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap", isActive ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900")}>
            {label}
        </Link>
    )
}

function PYQSection() {
    const [papers, setPapers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fallback/Static Papers ensuring we have 2024-2020
        const STATIC_PAPERS = [
            { id: 'GS1-2024', title: 'UPSC CSE Prelims 2024 - GS Paper 1', year: '2024' },
            { id: 'CSAT-2024', title: 'UPSC CSE Prelims 2024 - CSAT', year: '2024' },
            { id: 'GS1-2023', title: 'UPSC CSE Prelims 2023 - GS Paper 1', year: '2023' },
            { id: 'CSAT-2023', title: 'UPSC CSE Prelims 2023 - CSAT', year: '2023' },
            { id: 'GS1-2022', title: 'UPSC CSE Prelims 2022 - GS Paper 1', year: '2022' },
            { id: 'GS1-2021', title: 'UPSC CSE Prelims 2021 - GS Paper 1', year: '2021' },
            { id: 'GS1-2020', title: 'UPSC CSE Prelims 2020 - GS Paper 1', year: '2020' },
        ];

        api.getPYQPapers().then(data => {
            if (data && data.length > 0) {
                setPapers(data);
            } else {
                setPapers(STATIC_PAPERS);
            }
        }).catch(() => {
            setPapers(STATIC_PAPERS);
        });
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map(paper => (
                <Card key={paper.id} className="hover:border-blue-500 transition-colors cursor-pointer" onClick={() => navigate(`/pyq-test/${paper.id}`)}>
                    <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">{paper.year}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{paper.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">Full Length Paper</p>
                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Attempt Paper</button>
                </Card>
            ))}
        </div>
    )
}



function TestSection() {
    return <ClassTests />;
}
