# Casita Finder

A web platform for finding and managing rental properties, built with React, TypeScript, Vite, Tailwind CSS, and Firebase.

---

## 📋 System Prerequisites

Before running the project locally, ensure you have the following installed on your machine:

1. **Node.js** (v20+ recommended) and **npm**
2. **Java Runtime Environment (JRE 11+)**: Required by the Firebase Local Emulator Suite (Firestore & Storage).

> The Firebase CLI (`firebase-tools`) is included as a project dependency in `package.json` and is installed automatically when you run `npm install`.

### Installing Java (JRE)
- **Ubuntu / Debian:**
  ```bash
  sudo apt update && sudo apt install -y default-jre
  ```
- **macOS (Homebrew):**
  ```bash
  brew install openjdk
  ```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/sebasvelasco353/casita-finder.git
cd casita-finder
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory (you can copy from `.env.example`):

```bash
cp .env.example .env
```

For **local emulator development**, configure `.env` with the project ID and placeholder credentials:

```env
VITE_FIREBASE_API_KEY=fake-api-key
VITE_FIREBASE_AUTH_DOMAIN=una-casita.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=una-casita
VITE_FIREBASE_STORAGE_BUCKET=una-casita.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

---

## 💻 Running the Application

### Start Development Server + Firebase Emulators

```bash
npm run dev
```

This starts the Firebase Emulator Suite (Auth, Firestore, Storage, Functions) with local data imported from `./emulator-data`, exports changes on exit, and launches the Vite React frontend.

### Seed Database (Optional)

With the emulators running, open a new terminal window to seed sample users and properties:

```bash
npm run seed
```

---

## 🌐 Network & Port Reference

| Service | Port | Description | URL / Host |
| :--- | :--- | :--- | :--- |
| **Frontend (Vite)** | `5173` | React application with HMR | [http://localhost:5173](http://localhost:5173) |
| **Firebase Emulator UI** | `4000` | Web dashboard to view Auth, Firestore & Storage | [http://localhost:4000](http://localhost:4000) |
| **Firestore Emulator** | `8080` | Local Firestore database instance | `http://localhost:8080` |
| **Auth Emulator** | `9099` | Local Firebase Authentication instance | `http://localhost:9099` |
| **Storage Emulator** | `9199` | Local Cloud Storage bucket instance | `http://localhost:9199` |
| **Functions Emulator** | `5001` | Local Cloud Functions instance | `http://localhost:5001` |

---

## 🛠️ Troubleshooting

### Port Taken Errors (e.g. `Port 8080 is not open`)
If a background emulator or server process was not closed cleanly, kill all occupied ports:

```bash
# Linux / macOS:
fuser -k 5173/tcp 8080/tcp 9099/tcp 9199/tcp 5001/tcp 4000/tcp 4400/tcp 4500/tcp

# Or with npx:
npx kill-port 5173 8080 9099 9199 5001 4000
```

### `auth/invalid-api-key` Error
Ensure `.env` exists and that `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_PROJECT_ID` are not empty.

---

## 📦 Available Scripts

- `npm run dev`: Runs the Firebase emulators and Vite frontend.
- `npm run build`: Typechecks and bundles the application for production.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs ESLint checks across the codebase.
- `npm run seed`: Populates local Firestore and Auth emulators with mock seed data.
- `npm run deploy:hosting`: Deploys the built frontend to Firebase Hosting.
