import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Skeleton from '../components/Loader/Skeleton';

interface User {
    id: number;
    username: string;
    email: string;
    apellido: string;
    nombre: string;
    idrol: number;
    rol: string;
    estado: number;
}

interface AuthContextProps {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkToken: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Cargar usuario desde localStorage con validación segura
    const [user, setUser] = useState<User | null>(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (!storedUser || storedUser === 'undefined' || storedUser === 'null') return null;
            return JSON.parse(storedUser);
        } catch (error) {
            console.error('Error al parsear usuario guardado:', error);
            localStorage.removeItem('user');
            return null;
        }
    });

    const [token, setToken] = useState<string | null>(() => {
        const storedToken = localStorage.getItem('token');
        return storedToken && storedToken !== 'undefined' ? storedToken : null;
    });

    const [loading, setLoading] = useState(true);

    const login = async (username: string, password: string) => {
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await axios.post('https://api.helsy.com.co/iniciarSesion.php', formData);
            const { token, user, message } = response.data;

            // Verifica si la respuesta contiene datos válidos
            if (!token || !user) {
                throw new Error(message || 'No se pudo iniciar sesión. Verifica tus credenciales.');
            }

            // Guardar token y usuario
            setToken(token);
            setUser(user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error: any) {
            console.error('Error de autenticación:', error?.response?.data || error.message);
            throw new Error('Credenciales inválidas o error de red.');
        }
    };

    const logout = async () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const checkToken = async () => {
        // Método opcional para verificar validez del token
        return;
    };

    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div>
                <Skeleton />
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                checkToken,
                isAuthenticated: !!user && !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
