import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import AdminLayout from './AdminLayout';
import Login from './Login';
import Dashboard from './Dashboard';
import Invoices from './Invoices';
import Proposals from './Proposals';
import Contracts from './Contracts';

// The public website can render without loading the private admin dependencies.
export default function AdminRoutes() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="login" element={<Login />} />
                <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="proposals" element={<Proposals />} />
                    <Route path="contracts" element={<Contracts />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}
