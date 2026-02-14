import { create } from 'zustand';

const STORAGE_KEY = 'citscinet-auth';

function loadUser() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveUser(user) {
    if (typeof window === 'undefined') return;
    if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}

const useAuthStore = create((set, get) => ({
    user: loadUser(),

    login: (email, password) => {
        if (!email || !password) {
            return { success: false, error: 'Email and password are required.' };
        }

        // Check localStorage for registered users
        const users = JSON.parse(localStorage.getItem('citscinet-users') || '[]');
        const found = users.find(u => u.email === email);

        if (found) {
            if (found.password !== password) {
                return { success: false, error: 'Incorrect password.' };
            }
            const user = { email: found.email, name: found.name, role: found.role };
            set({ user });
            saveUser(user);
            return { success: true, role: user.role };
        }

        // Default demo accounts
        const role = email.includes('researcher') ? 'researcher' : 'citizen';
        const user = { email, name: email.split('@')[0], role };
        set({ user });
        saveUser(user);
        return { success: true, role };
    },

    signup: (email, password, role = 'citizen', name = '') => {
        if (!email || !password) {
            return { success: false, error: 'Email and password are required.' };
        }

        const users = JSON.parse(localStorage.getItem('citscinet-users') || '[]');

        if (users.find(u => u.email === email)) {
            return { success: false, error: 'An account with this email already exists.' };
        }

        const newUser = { email, password, name: name || email.split('@')[0], role };
        users.push(newUser);
        localStorage.setItem('citscinet-users', JSON.stringify(users));

        const user = { email: newUser.email, name: newUser.name, role: newUser.role };
        set({ user });
        saveUser(user);
        return { success: true };
    },

    logout: () => {
        set({ user: null });
        saveUser(null);
    },

    isAuthenticated: () => {
        return !!get().user;
    },
}));

export default useAuthStore;
