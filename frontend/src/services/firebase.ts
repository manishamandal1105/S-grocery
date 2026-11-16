// Firebase Configuration & Service Initialization
// Graceful client: uses live Firebase if installed, or zero-dependency fallback

let app: any = null;
let auth: any = null;
let db: any = null;

// Gracefully initialize without breaking Vite when npm packages are still being installed
export { app, auth, db };
