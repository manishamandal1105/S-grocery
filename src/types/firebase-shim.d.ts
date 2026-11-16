// TypeScript declarations for Firebase modules when running in local / development mode
declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: Record<string, any>;
  }
  export function initializeApp(options: Record<string, any>): FirebaseApp;
  export function getApps(): FirebaseApp[];
}

declare module 'firebase/auth' {
  export interface User {
    uid: string;
    email: string | null;
    displayName?: string | null;
  }
  export interface UserCredential {
    user: User;
  }
  export interface Auth {
    app: any;
    currentUser: User | null;
  }
  export function getAuth(app?: any): Auth;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function sendPasswordResetEmail(auth: Auth, email: string): Promise<void>;
  export function signOut(auth: Auth): Promise<void>;
  export function onAuthStateChanged(auth: Auth, nextOrObserver: (user: User | null) => void): () => void;
}

declare module 'firebase/firestore' {
  export interface Timestamp {
    seconds: number;
    nanoseconds: number;
    toDate(): Date;
  }
  export const Timestamp: {
    now(): Timestamp;
    fromDate(date: Date): Timestamp;
    fromMillis(milliseconds: number): Timestamp;
  };
  export interface Firestore {
    type: string;
    app: any;
  }
  export function getFirestore(app?: any): Firestore;
  export function doc(db: Firestore, collectionName: string, id: string): any;
  export function setDoc(reference: any, data: any, options?: any): Promise<void>;
  export function getDoc(reference: any): Promise<any>;
  export function updateDoc(reference: any, data: any): Promise<void>;
  export function collection(db: Firestore, collectionName: string): any;
  export function addDoc(reference: any, data: any): Promise<any>;
  export function query(reference: any, ...queryConstraints: any[]): any;
  export function where(fieldPath: string, opStr: string, value: any): any;
  export function orderBy(fieldPath: string, directionStr?: string): any;
  export function limit(limitNum: number): any;
  export function getDocs(query: any): Promise<any>;
  export function serverTimestamp(): any;
}

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
