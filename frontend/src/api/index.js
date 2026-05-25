import axios from 'axios'

const API = axios.create({ baseURL: '/api' })

API.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login    = (username, password) => API.post('/login/',    { username, password })
export const register = (data)               => API.post('/register/', data)
export const getMe    = ()                   => API.get('/me/')

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts   = ()      => API.get('/products/')
export const addProduct    = (data)  => API.post('/products/', data)
export const updateProduct = (id, d) => API.put(`/products/${id}/`, d)
export const deleteProduct = (id)    => API.delete(`/products/${id}/`)

// ── Variants ──────────────────────────────────────────────────────────────────
export const getVariants   = (productId)       => API.get(`/products/${productId}/variants/`)
export const addVariant    = (productId, data)  => API.post(`/products/${productId}/variants/`, data)
export const updateVariant = (variantId, data)  => API.put(`/variants/${variantId}/`, data)
export const deleteVariant = (variantId)        => API.delete(`/variants/${variantId}/`)

// ── Image Upload ──────────────────────────────────────────────────────────────
export const uploadImage = (file) => {
    const form = new FormData()
    form.append('image', file)
    return API.post('/products/upload-image/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const getOrders         = ()           => API.get('/orders/')
export const createOrder       = (data)       => API.post('/orders/', data)
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/status/`, { status })

// ── Users (Admin) ─────────────────────────────────────────────────────────────
export const getUsers   = ()         => API.get('/users/')
export const updateRole = (id, role) => API.put(`/users/${id}/`, { role })
export const deleteUser = (id)       => API.delete(`/users/${id}/`)

// ── Sales Log (Admin) ─────────────────────────────────────────────────────────
export const getSalesLog = () => API.get('/sales-log/')

export default API

// ── Order Items ───────────────────────────────────────────────────────────────
export const getOrderItems = (orderId) => API.get(`/orders/${orderId}/items/`)