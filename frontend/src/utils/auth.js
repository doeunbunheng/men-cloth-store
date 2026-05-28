// src/utils/auth.js
// Helpers for reading/writing the logged-in user from localStorage.
//
// Assumption: after a successful login, your authApi.login() does:
//   localStorage.setItem('token', token);
//   localStorage.setItem('user', JSON.stringify(user));
// where `user` includes at least { username, role } from your USERS table.
// Roles from your Oracle schema: 'Admin' | 'Sale' | 'Customer'

const TOKEN_KEY = 'token';
const USER_KEY  = 'user';

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated() {
    return !!getToken() && !!getUser();
}

/**
 * Check if the logged-in user has one of the allowed roles.
 * @param {string | string[]} allowedRoles - 'Admin' or ['Admin','Sale']
 */
export function hasRole(allowedRoles) {
    const user = getUser();
    if (!user || !user.role) return false;
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return allowed.includes(user.role);
}

export function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}