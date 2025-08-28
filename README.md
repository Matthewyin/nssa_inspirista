# Inspirista

Inspirista is a Next.js application designed to help users capture, refine, and organize their thoughts, ideas, and inspirations. It leverages AI to enhance the note-taking experience and uses Firebase for seamless authentication and real-time data synchronization.

This project was built in Firebase Studio.

## Features

-   **Cloud-Synced Notes**: Create, edit, and delete notes that are saved to your account.
-   **Firebase Integration**:
    -   **Authentication**: Secure user login with Google Sign-In.
    -   **Firestore**: Real-time database for storing and syncing notes across devices.
-   **AI-Powered Features (via Genkit)**:
    -   **Refine Notes**: Use Google Gemini or DeepSeek to automatically organize and summarize note content.
    -   **Suggest Tags**: Automatically get tag suggestions based on your note's content.
-   **Multi-Provider AI**: Configure and switch between different AI providers (Google Gemini, DeepSeek).
-   **Multi-Language Support**: UI available in English and Chinese.
-   **Theme Switching**: Light and Dark mode support.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
-   **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
-   **Hosting**: Configured for [Firebase App Hosting](https://firebase.google.com/docs/hosting)
-   **AI**: [Genkit](https://firebase.google.com/docs/genkit)
-   **UI**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
-   **Components**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

### 1. Prerequisites

-   [Node.js](https://nodejs.org/en) (v18 or later)
-   A Firebase Project

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/Matthewyin/nssa_Inspirista.git
cd nssa_Inspirista
npm install
```

### 3. Firebase Configuration

You need to connect the app to your Firebase project.

1.  Create a `.env` file in the root of the project by copying the example:
    ```bash
    cp .env.example .env
    ```
2.  Go to your Firebase project settings in the [Firebase Console](https://console.firebase.google.com/).
3.  Under "Your apps", select your web app.
4.  Copy the Firebase configuration object (SDK setup and configuration).
5.  Paste the corresponding values into your `.env` file. It should look like this:

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...
    ```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
