const STORAGE_KEY = 'digitaltrade_mock_db';

const defaultData = {
    profiles: [
        { id: 'u1', email: 'user@demo.com', full_name: 'Demo Trader', balance: 10000, profit: 2500, is_admin: false, created_at: new Intl.DateTimeFormat('en-US').format(new Date()) },
        { id: 'a1', email: 'admin@demo.com', full_name: 'Demo Admin', balance: 50000, profit: 15000, is_admin: true, created_at: new Intl.DateTimeFormat('en-US').format(new Date()) }
    ],
    investments: [],
    transactions: [
        { id: 't1', user_id: 'u1', type: 'withdrawal', amount: 500, status: 'pending', description: 'Withdrawal to external wallet', created_at: new Intl.DateTimeFormat('en-US').format(new Date()) }
    ],
    settings: [
        { key: 'deposit_address', value: 'bc1qxy2kgdyrjrsqz7u6u67js8yp5z2n5a5fs4af32' }
    ]
};

// Types & Helpers
const getDB = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(defaultData));
const saveDB = (db: any) => localStorage.setItem(STORAGE_KEY, JSON.stringify(db));

class QueryBuilder {
    private table: string;
    private db: any;
    private filters: any[] = [];
    private ordering: any = null;
    private isSingle = false;

    constructor(table: string) {
        this.table = table;
        this.db = getDB();
    }

    select(_query: string = '*') { return this; }

    eq(column: string, value: any) {
        this.filters.push({ column, value });
        return this;
    }

    order(column: string, options: { ascending: boolean } = { ascending: true }) {
        this.ordering = { column, ...options };
        return this;
    }

    single() {
        this.isSingle = true;
        return this;
    }

    async insert(data: any) {
        const list = this.db[this.table];
        const newItem = { id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString(), ...data };
        list.push(newItem);
        saveDB(this.db);
        return { data: newItem, error: null };
    }

    async update(updates: any) {
        const list = this.db[this.table];
        let count = 0;
        const updatedList = list.map((item: any) => {
            const match = this.filters.every(f => item[f.column] === f.value);
            if (match) {
                count++;
                return { ...item, ...updates };
            }
            return item;
        });
        this.db[this.table] = updatedList;
        saveDB(this.db);
        return { data: updatedList.filter((item: any) => this.filters.every(f => item[f.column] === f.value)), error: null };
    }

    async upsert(data: any) {
        const list = this.db[this.table];
        const key = (data as any).key;
        const idx = list.findIndex((item: any) => item.key === key);
        if (idx >= 0) list[idx] = { ...list[idx], ...data };
        else list.push(data);
        saveDB(this.db);
        return { data, error: null };
    }

    async then(resolve: any) {
        let list = [...this.db[this.table]];

        // Apply filters
        list = list.filter(item => this.filters.every(f => item[f.column] === f.value));

        // Apply ordering
        if (this.ordering) {
            list.sort((a, b) => {
                const valA = a[this.ordering.column];
                const valB = b[this.ordering.column];
                if (valA < valB) return this.ordering.ascending ? -1 : 1;
                if (valA > valB) return this.ordering.ascending ? 1 : -1;
                return 0;
            });
        }

        if (this.isSingle) resolve({ data: list[0] || null, error: null });
        else resolve({ data: list, error: null });
    }
}

export const mockSupabase = {
    auth: {
        getSession: async () => {
            const sessionStr = localStorage.getItem('digitaltrade_session');
            return { data: { session: sessionStr ? JSON.parse(sessionStr) : null }, error: null };
        },
        signInWithPassword: async ({ email }: { email: string }) => {
            const db = getDB();
            const profile = db.profiles.find((p: any) => p.email === email);
            if (!profile) return { data: { user: null }, error: { message: 'Invalid credentials' } };

            const session = { user: { id: profile.id, email: profile.email }, expires_at: Date.now() + 3600000 };
            localStorage.setItem('digitaltrade_session', JSON.stringify(session));
            // Re-trigger auth change manually for mock
            window.dispatchEvent(new Event('auth-change'));
            return { data: { user: session.user, session }, error: null };
        },
        signUp: async ({ email, password: _password, options }: any) => {
            const db = getDB();
            const profile = {
                id: Math.random().toString(36).substr(2, 9),
                email,
                full_name: options?.data?.full_name || 'New Trader',
                balance: 0,
                profit: 0,
                is_admin: false,
                created_at: new Date().toISOString()
            };
            db.profiles.push(profile);
            saveDB(db);
            return { data: { user: { id: profile.id, email } }, error: null };
        },
        signOut: async () => {
            localStorage.removeItem('digitaltrade_session');
            window.dispatchEvent(new Event('auth-change'));
            return { error: null };
        },
        onAuthStateChange: (callback: any) => {
            const handler = () => {
                const sessionStr = localStorage.getItem('digitaltrade_session');
                callback('SIGNED_IN', sessionStr ? JSON.parse(sessionStr) : null);
            };
            window.addEventListener('auth-change', handler);
            return { data: { subscription: { unsubscribe: () => window.removeEventListener('auth-change', handler) } } };
        }
    },
    from: (table: string) => new QueryBuilder(table),
    channel: () => ({
        on: () => ({
            subscribe: () => ({ unsubscribe: () => { } })
        })
    }),
    removeChannel: () => { }
};
