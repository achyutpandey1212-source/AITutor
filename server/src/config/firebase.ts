import admin from 'firebase-admin';

let isInitialized = false;

export const initializeFirebaseAdmin = (): typeof admin => {
  if (isInitialized || admin.apps.length > 0) {
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    isInitialized = true;
    console.log('✅ Firebase Admin initialized with service account credentials');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    admin.initializeApp();
    isInitialized = true;
    console.log('✅ Firebase Admin initialized with default credentials / emulator');
  } else {
    console.warn('⚠️ Firebase Admin credentials not fully configured. Auth verification may fail.');
    admin.initializeApp({
      projectId: projectId || 'ai-tutor-placeholder',
    });
    isInitialized = true;
  }

  return admin;
};

export const getFirebaseAuth = () => {
  const adminApp = initializeFirebaseAdmin();
  return adminApp.auth();
};
