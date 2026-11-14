import { Component, lazy, Suspense } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import LandingPage from './landing/LandingPage';

const AdminRoutes = lazy(() => import('./admin/AdminRoutes'));
const MotionStudies = lazy(() => import('./landing/MotionStudies'));

class AdminBoundary extends Component {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        if (this.state.failed) {
            return (
                <main className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center gap-5 p-8 text-center">
                    <h1 className="text-2xl">The admin area could not load.</h1>
                    <p>Refresh the page to try again.</p>
                    <Link to="/" className="underline underline-offset-4">Return to BERIX</Link>
                </main>
            );
        }
        return this.props.children;
    }
}

function NotFound() {
    return (
        <main className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center gap-5 p-8 text-center">
            <p className="font-mono text-sm">404</p>
            <h1 className="text-3xl">This page does not exist.</h1>
            <Link to="/" className="underline underline-offset-4">Return to BERIX</Link>
        </main>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/motion-studies" element={<Suspense fallback={<main className="min-h-screen bg-paper text-ink grid place-items-center" aria-busy="true">Loading motion studies…</main>}><MotionStudies /></Suspense>} />
                <Route path="/admin/*" element={
                    <AdminBoundary>
                        <Suspense fallback={<main className="min-h-screen bg-paper text-ink grid place-items-center" aria-busy="true">Loading admin…</main>}>
                            <AdminRoutes />
                        </Suspense>
                    </AdminBoundary>
                } />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
