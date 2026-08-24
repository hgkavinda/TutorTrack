import { useEffect, useState } from 'react';
import api from '../api/client';
import { AuthContext } from './AuthContextValue';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [role, setRole] = useState(localStorage.getItem('authRole') || 'teacher');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                localStorage.removeItem('token');
                localStorage.removeItem('authRole');
                setUser(null);
                setLoading(false);
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('authRole', role);
            try {
                const endpoint = role === 'student' ? '/auth/student/me' : '/auth/me';
                const response = await api.get(endpoint);
                setUser({ ...response.data.data, role });
            } catch {
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [token, role]);

    const login = async (identifier, password, loginRole) => {
        const endpoint = loginRole === 'student' ? '/auth/student/login' : '/auth/login';
        const payload = loginRole === 'student'
            ? { username: identifier, password }
            : { email: identifier, password };
        const response = await api.post(endpoint, payload);

        setLoading(true);
        setRole(response.data.role);
        setToken(response.data.token);
        return response.data;
    };

    const changeStudentPassword = async (currentPassword, newPassword) => {
        await api.put('/auth/student/change-password', { currentPassword, newPassword });
        setUser((currentUser) => ({ ...currentUser, mustChangePassword: false }));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            role,
            loading,
            login,
            logout,
            changeStudentPassword,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
