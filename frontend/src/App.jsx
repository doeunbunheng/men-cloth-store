import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login            from './pages/Login'
import Register         from './pages/Register'
import Products         from './pages/customer/Products'
import MyOrders         from './pages/customer/MyOrders'
import SaleDashboard    from './pages/sale/SaleDashboard'
import NewOrder         from './pages/sale/NewOrder'
import AdminDashboard   from './pages/admin/AdminDashboard'
import ManageUsers      from './pages/admin/ManageUsers'
import ManageProducts   from './pages/admin/ManageProducts'
import LowStock         from './pages/admin/LowStock'
import Navbar           from './components/Navbar'
import Backup from './pages/admin/Backup'





function PrivateRoute({ children, roles }) {
    const token = localStorage.getItem('token')
    const role  = localStorage.getItem('role')
    if (!token) return <Navigate to="/login" />
    if (roles && !roles.includes(role)) return <Navigate to="/" />
    return children
}

function HomeRedirect() {
    const role = localStorage.getItem('role')
    if (role === 'Admin')    return <Navigate to="/admin" />
    if (role === 'Sale')     return <Navigate to="/sale" />
    if (role === 'Customer') return <Navigate to="/products" />
    // Not logged in → show products publicly
    return <Navigate to="/products" />
}

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
                <Routes>
                    {/* Public — no login needed */}
                    <Route path="/login"    element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/products" element={<Products />} />  {/* ← public */}
                    <Route path="/"         element={<HomeRedirect />} />

                    {/* Customer — login required to buy */}
                    <Route path="/my-orders" element={
                        <PrivateRoute roles={['Customer']}><MyOrders /></PrivateRoute>} />

                    {/* Sale */}
                    <Route path="/sale" element={
                        <PrivateRoute roles={['Sale','Admin']}><SaleDashboard /></PrivateRoute>} />
                    <Route path="/sale/new-order" element={
                        <PrivateRoute roles={['Sale','Admin']}><NewOrder /></PrivateRoute>} />

                    {/* Admin */}
                    <Route path="/admin" element={
                        <PrivateRoute roles={['Admin']}><AdminDashboard /></PrivateRoute>} />
                    <Route path="/admin/users" element={
                        <PrivateRoute roles={['Admin']}><ManageUsers /></PrivateRoute>} />
                    <Route path="/admin/products" element={
                        <PrivateRoute roles={['Admin']}><ManageProducts /></PrivateRoute>} />
                    <Route path="/admin/low-stock" element={
                        <PrivateRoute roles={['Admin','Sale']}><LowStock /></PrivateRoute>} />
                    <Route path="/admin/backup" element={
                        <PrivateRoute roles={['Admin']}><Backup /></PrivateRoute>} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}