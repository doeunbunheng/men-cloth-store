// src/components/common/ProtectedRoute.jsx
// Wraps any route that requires authentication and/or a specific role.
//
// Usage in AppRoutes.jsx:
//   <Route path="/admin" element={
//       <ProtectedRoute allowedRoles="Admin">
//           <DashboardLayout />
//       </ProtectedRoute>
//   }>
//       <Route index element={<AdminDashboard />} />
//       <Route path="users" element={<ManageUsers />} />
//       ...
//   </Route>

import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, hasRole } from '../../utils/auth';

export default function ProtectedRoute({ allowedRoles, children }) {
    const location = useLocation();

    // Not logged in -> send to login, remember where they wanted to go
    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Logged in but wrong role -> send to "not authorized" or home
    if (allowedRoles && !hasRole(allowedRoles)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}
