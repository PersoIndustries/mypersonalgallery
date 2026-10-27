import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  museums as seedMuseums,
  objects as seedObjects,
  users as seedUsers,
} from "./mock-data";
import type { CollectionObject, Museum, User } from "./types";

const STORAGE_KEY = "myownmuseum.state.v1";
const THEME_KEY = "myownmuseum.theme";

interface PersistedState {
  museums: Museum[];
  objects: CollectionObject[];
  users: User[];
  currentUserId: string | null;
}

interface StoreValue extends PersistedState {
  currentUser: User | null;
  publicMuseums: Museum[];
  publicObjects: CollectionObject[];
  ready: boolean;
  theme: "dark" | "light";
  toggleTheme: () => void;
  login: (identifier: string) => User;
  signup: (name: string, username: string) => User;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
  museumsOf: (ownerId: string) => Museum[];
  objectsOf: (museumId: string) => CollectionObject[];
  getMuseum: (idOrSlug: string) => Museum | undefined;
  getObject: (id: string) => CollectionObject | undefined;
  createMuseum: (data: Omit<Museum, "id" | "slug" | "ownerId" | "createdAt">) => Museum;
  updateMuseum: (id: string, patch: Partial<Museum>) => void;
  deleteMuseum: (id: string) => void;
  createObject: (
    museumId: string,
    data: Omit<CollectionObject, "id" | "museumId" | "createdAt">,
  ) => CollectionObject;
  updateObject: (id: string, patch: Partial<CollectionObject>) => void;
  deleteObject: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48) || "museum";

const fallbackUser = seedUsers[0] as User;

const uid = (prefix: string) => `${prefix}${Math.random().toString(36).slice(2, 9)}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>({
    museums: seedMuseums,
    objects: seedObjects,
    users: seedUsers,
    currentUserId: null,
  });
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        if (parsed?.museums?.length) setState(parsed);
      }
      const savedTheme = window.localStorage.getItem(THEME_KEY);
      if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota */
    }
  }, [state, ready]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.style.colorScheme = theme;
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.users, state.currentUserId],
  );

  const login = useCallback((identifier: string) => {
    let found: User | undefined;
    setState((prev) => {
      const key = identifier.trim().toLowerCase().replace(/^@/, "");
      found =
        prev.users.find((u) => u.username.toLowerCase() === key) ??
        prev.users.find((u) => u.name.toLowerCase().includes(key)) ??
        fallbackUser;
      return { ...prev, currentUserId: found.id };
    });
    return found ?? fallbackUser;
  }, []);

  const signup = useCallback((name: string, username: string) => {
    const user: User = {
      id: uid("u"),
      name: name.trim() || "New Curator",
      username: slugify(username || name || "curator"),
      avatar: `https://picsum.photos/seed/${slugify(username || name || "curator")}/300/300`,
      bio: "",
      location: "",
      joined: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({ ...prev, users: [...prev.users, user], currentUserId: user.id }));
    return user;
  }, []);

  const logout = useCallback(() => setState((prev) => ({ ...prev, currentUserId: null })), []);

  const updateProfile = useCallback((patch: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === prev.currentUserId ? { ...u, ...patch } : u)),
    }));
  }, []);

  const publicMuseums = state.museums.filter((m) => m.isPublic);
  const publicIds = new Set(publicMuseums.map((m) => m.id));
  const publicObjects = state.objects.filter(
    (o) => o.isVisible !== false && publicIds.has(o.museumId),
  );

  const value: StoreValue = {
    ...state,
    publicMuseums,
    publicObjects,
    currentUser,
    ready,
    theme,
    toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    login,
    signup,
    logout,
    updateProfile,
    museumsOf: (ownerId) => state.museums.filter((m) => m.ownerId === ownerId),
    objectsOf: (museumId) => state.objects.filter((o) => o.museumId === museumId),
    getMuseum: (idOrSlug) =>
      state.museums.find((m) => m.id === idOrSlug || m.slug === idOrSlug),
    getObject: (id) => state.objects.find((o) => o.id === id),
    createMuseum: (data) => {
      const museum: Museum = {
        ...data,
        id: uid("m"),
        slug: slugify(data.title),
        ownerId: state.currentUserId ?? fallbackUser.id,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setState((prev) => ({ ...prev, museums: [museum, ...prev.museums] }));
      return museum;
    },
    updateMuseum: (id, patch) =>
      setState((prev) => ({
        ...prev,
        museums: prev.museums.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      })),
    deleteMuseum: (id) =>
      setState((prev) => ({
        ...prev,
        museums: prev.museums.filter((m) => m.id !== id),
        objects: prev.objects.filter((o) => o.museumId !== id),
      })),
    createObject: (museumId, data) => {
      const object: CollectionObject = {
        ...data,
        id: uid("o"),
        museumId,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setState((prev) => ({ ...prev, objects: [object, ...prev.objects] }));
      return object;
    },
    updateObject: (id, patch) =>
      setState((prev) => ({
        ...prev,
        objects: prev.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
      })),
    deleteObject: (id) =>
      setState((prev) => ({ ...prev, objects: prev.objects.filter((o) => o.id !== id) })),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
