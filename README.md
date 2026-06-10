# 🎙️ Voice to Story Generator 📖

An AI-powered creative writing studio that transforms spoken conversations, voice recordings, and dialogue audio files into rich, stylized narrative stories. Built on the MERN stack with the official Google Gemini SDK.

---

## ✨ Features

- **🗣️ Audio Transcription & Speaker Diarization**: Upload files (`WAV`, `MP3`, `M4A`, `FLAC`, `OGG`, `WebM`) or record your voice directly from the browser. Employs Gemini for speech-to-text, speaker segmentation, and tone detection.
- **✍️ Interactive Dialogue Editor**: Refine speaker assignments, adjust text, and modify emotional undertones (Happy, Sad, Angry, Excited, Neutral).
- **📊 Speech Analytics**: Visualize conversational dynamics, speaker turn ratios, and emotional flow.
- **📚 Story Studio**: Weave raw dialogue transcripts into customized literary styles (Narrative Short Story, Screenplay script, Professional News Article, Epic Fantasy, etc.) using custom system prompt directives.
- **💾 MERN Persistence & Smart Fallback**: Saves your work to MongoDB. If MongoDB is not running locally, it gracefully switches to session-based in-memory storage so the app remains fully functional.
- **📄 Document Export**: Compile and download complete reports containing metadata, transcripts, and generated stories as formatted PDF or JSON files.
![Uploading Screenshot 2026-06-10 121439.png…]()

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Recharts (Analytics)
- **Backend**: Node.js, Express, Multer (in-memory file processing), PDFKit (PDF generation)
- **AI Engine**: Official `@google/genai` SDK using Gemini models with automated fallback retry logic (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.0-flash`)
- **Database**: MongoDB (via Mongoose) with an in-memory storage fallback

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Git](https://git-scm.com/)

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

# MongoDB Connection String (Optional, defaults to local MongoDB)
# MONGODB_URI=mongodb://localhost:27017/voice-to-story
```

---

## 💻 Running the Application

You need to run both the frontend dev server and the backend server.

### Start the Backend Server
```bash
cd backend
npm install
npm run dev
```
The server will run on **`http://localhost:5000`**.

### Start the Frontend Server
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on **`http://localhost:5173`**.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.
