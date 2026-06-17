# 🎙️ Voice to Story Generator 📖

An AI-powered creative writing studio that transforms spoken conversations, voice recordings, and dialogue audio files into rich, stylized narrative stories. Built on a modern full-stack JavaScript architecture using the official **Google Gemini SDK** and optimized for **Vercel** serverless environments.

🌐 **Live Demo:** [voicetostory.vercel.app](https://voicetostory.vercel.app/)

---

## ✨ Key Features

*   **🗣️ Audio Transcription & Speaker Diarization**: Upload audio files (`WAV`, `MP3`, `M4A`, `FLAC`, `OGG`, `WebM`, `MPEG`) or record voice directly from the browser. Employs Gemini for speech-to-text, speaker segmentation, and tone detection.
*   **🔌 Offline Fallback**: Switch to browser-native **Web Speech API** for free, offline, client-side transcription when API keys aren't configured.
*   **✍️ Interactive Dialogue Editor**: Refine speaker assignments, adjust text, and modify emotional undertones (Happy, Sad, Angry, Excited, Neutral).
*   **📊 Speech Analytics**: Visualize conversational dynamics, speaker turn ratios, and emotional flow using interactive charts.
*   **📚 Story Studio**: Weave raw dialogue transcripts into customized literary styles (Narrative Short Story, Screenplay script, Professional News Article, Epic Fantasy, etc.) using custom system prompt directives.
*   **💾 Database Persistence & Smart Fallback**: Saves your work to MongoDB. If MongoDB is not running locally or in production, it gracefully switches to session-based in-memory storage.
*   **📄 Document Export**: Compile and download complete reports containing metadata, transcripts, and generated stories as formatted PDF or plain text files.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Recharts (Analytics)
*   **Backend**: Node.js, Express, Multer (in-memory file processing), PDFKit (PDF generation)
*   **AI Engine**: Official `@google/genai` SDK using Gemini models with automated fallback retry logic (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.0-flash`)
*   **Database**: MongoDB (via Mongoose) with in-memory storage fallback
*   **Deployment**: Vercel Serverless (Single project, unified frontend/backend router)

---

## 🚀 Local Development Quick Start

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18 or higher recommended) and [Git](https://git-scm.com/) installed.

### 2. Clone the Repository
```bash
git clone https://github.com/Umangpandey75/Voice-to-Story-Generator.git
cd Voice-to-Story-Generator
```

### 3. Configure Environment Variables
Create a `.env` file in the root folder:
```env
# Google Gemini API Key (Get one from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB Connection String (Optional, defaults to local MongoDB or in-memory)
MONGODB_URI=mongodb://localhost:27017/voice-to-story
```

### 4. Running the Application
You need to run both the frontend dev server and the backend server.

*   **Start the Backend**:
    ```bash
    cd backend
    npm install
    npm run dev
    ```
    The server will run on `http://localhost:5000`.

*   **Start the Frontend**:
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```
    The frontend will run on `http://localhost:5173`.

---

## ☁️ Production Deployment (Vercel-Only)

This project is configured as a single Vercel project using Vercel Serverless Functions.

### ⚙️ Vercel Project Setup:
1. Push your code to your GitHub repository.
2. Link the repository to your [Vercel Dashboard](https://vercel.com).
3. Under **Application Preset**, select **"Other"** or **"Vite"** (do NOT use the experimental "Services" preset).
4. Add the following **Environment Variables** in the Vercel Settings:
   * `GEMINI_API_KEY`: *(Your Gemini API Key)*
   * `MONGODB_URI`: *(Your MongoDB Atlas connection string to persist logs)*
5. Click **Deploy**. Vercel will automatically build the React assets and map `/api/*` requests to the Express serverless backend functions.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.
