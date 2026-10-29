import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/api';
import { ROLE_SUPER_ADMIN } from '../constants/roles';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [impersonating, setImpersonating] = useState(
        () => localStorage.getItem('impersonate') === 'true'
    );

    useEffect(() => {
        checkAuth();
    }, []);


    const checkAuth = async () => {
        const token = localStorage.getItem("auth_token");

        if (token) {
            try {
                api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                const response = await api.get("/user");

                setUser(response.data);
            } catch {
                localStorage.removeItem("auth_token");
                delete api.defaults.headers.common["Authorization"];
                setUser(null);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
            setUser(null);
            return;
        }
    };

    const updateAuthState = (token, userData) => {
        localStorage.setItem('auth_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const clearAuthState = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem("original_auth_token");
        localStorage.removeItem("impersonate");
        delete api.defaults.headers.common['Authorization'];
        setImpersonating(false);
        setUser(null);
    }

    // Super Admin "log in as this user" — centralizes the impersonation
    // token swap so no other component touches these localStorage keys
    // directly (previously User.jsx wrote them and Dashboard.jsx read
    // them, with no single owner of the state).
    //
    // Deliberately re-fetches /user via checkAuth() instead of trusting
    // the impersonation endpoint's own `user` field, which is a bare User
    // model without `roles`/`permissions` — using it directly left every
    // can() check silently failing (undefined.includes → false) right
    // after impersonating, even though the backend/sidebar saw the
    // correct permissions. /user is the one canonical source for "what
    // does the current token's user look like."
    const startImpersonation = async (token) => {
        const currentToken = localStorage.getItem('auth_token');

        if (currentToken) {
            localStorage.setItem('original_auth_token', currentToken);
        }

        localStorage.setItem('impersonate', 'true');
        setImpersonating(true);

        localStorage.setItem('auth_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await checkAuth();
    };

    // Restores the Super Admin's own session. Returns false if there was
    // nothing to restore (e.g. the key was already cleared elsewhere).
    const stopImpersonation = async () => {
        const originalToken = localStorage.getItem('original_auth_token');

        if (!originalToken) {
            return false;
        }

        localStorage.removeItem('original_auth_token');
        localStorage.removeItem('impersonate');
        setImpersonating(false);

        localStorage.setItem('auth_token', originalToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${originalToken}`;

        await checkAuth();

        return true;
    };

    // Different endpoints have shaped `user.roles` differently — /user
    // (the canonical source, via checkAuth) returns plain name strings,
    // but at least one other endpoint's response spreads the eager-loaded
    // Spatie `roles` relation directly, giving an array of {id, name, ...}
    // objects instead. Normalizing here means can()/hasRole() work no
    // matter which shape the currently-loaded `user` came from, instead
    // of silently breaking (array.includes("Super Admin") never matches
    // an object) whenever a new endpoint gets this wrong.
    const roleNames = (roles) =>
        (roles ?? []).map((role) => (typeof role === 'string' ? role : role?.name)).filter(Boolean);

    // Permission Helper
    const can = (permission) => {
        if (!user) return false;

        // Super Admin can do everything
        if (roleNames(user.roles).includes(ROLE_SUPER_ADMIN)) {
            return true;
        }

        return user.permissions?.includes(permission);
    };

    // Role Helper
    const hasRole = (role) => {

        if (!user) return false;

        return roleNames(user.roles).includes(role);

    };

    return (
        <AuthContext.Provider value={{
            user,
            updateAuthState,
            loading,
            checkAuth,
            clearAuthState,
            can,
            hasRole,
            impersonating,
            startImpersonation,
            stopImpersonation,
        }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);
