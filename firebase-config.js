// ==========================================
// EMPLOYEE PRO
// FIREBASE + FIRESTORE CONFIGURATION
// ==========================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDR6Ab5X3PelrvdAjLhPsCi_n4Qi6MHf-o",
    authDomain: "employee-attendance-syst-33351.firebaseapp.com",
    projectId: "employee-attendance-syst-33351",
    storageBucket: "employee-attendance-syst-33351.firebasestorage.app",
    messagingSenderId: "672059529814",
    appId: "1:672059529814:web:971eefee24b9a2ba33b9f7"
};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

firebase.initializeApp(firebaseConfig);


// ==========================================
// INITIALIZE FIRESTORE
// ==========================================

const db = firebase.firestore();


// ==========================================
// FIRESTORE COLLECTIONS
// ==========================================

const COLLECTIONS = {

    EMPLOYEES: "employees",

    ATTENDANCE: "attendance",

    LEAVES: "leaves",

    PAYROLL: "payroll",

    SETTINGS: "settings"

};


// ==========================================
// SETTINGS DOCUMENT
// ==========================================

const SETTINGS_DOC = "company";


// ==========================================
// DEFAULT SETTINGS
// ==========================================

const DEFAULT_SETTINGS = {

    officeStartTime: "09:00",

    officeEndTime: "18:00",

    gracePeriod: 15,

    weeklyOff: 0,

    overtimeRate: 0

};


// ==========================================
// FIREBASE CONNECTION STATUS
// ==========================================

console.log("🔥 Firebase Initialized Successfully");

console.log(
    "📦 Firebase Project:",
    firebaseConfig.projectId
);


// ==========================================
// FIRESTORE CONNECTION TEST
// ==========================================

db.collection(COLLECTIONS.SETTINGS)
    .doc(SETTINGS_DOC)
    .get()

    .then((doc) => {

        console.log(
            "✅ Firestore Connected Successfully"
        );

        if (!doc.exists) {

            console.log(
                "ℹ️ Company settings not found. Default settings will be used."
            );

        } else {

            console.log(
                "⚙️ Company settings loaded successfully."
            );

        }

    })

    .catch((error) => {

        console.error(
            "❌ Firestore Connection Error:",
            error
        );

    });