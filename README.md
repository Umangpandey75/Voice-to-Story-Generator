# 🎙️ Voice to Story Generator 📖

An AI-powered creative writing studio that transforms spoken conversations, voice recordings, and dialogue audio files into rich, stylized narrative stories. Built on the MERN stack with the official Google Gemini SDK.

---

## ✨ Features

- **🗣️ Audio Transcription & Speaker Diarization**: Upload files (`WAV`, `MP3`, `M4A`, `FLAC`, `OGG`, `WebM`, `MPEG`) or record your voice directly from the browser. Employs Gemini for speech-to-text, speaker segmentation, and tone detection.
- **✍️ Interactive Dialogue Editor**: Refine speaker assignments, adjust text, and modify emotional undertones (Happy, Sad, Angry, Excited, Neutral).
- **📊 Speech Analytics**: Visualize conversational dynamics, speaker turn ratios, and emotional flow.
- **📚 Story Studio**: Weave raw dialogue transcripts into customized literary styles (Narrative Short Story, Screenplay script, Professional News Article, Epic Fantasy, etc.) using custom system prompt directives.
- **💾 MERN Persistence & Smart Fallback**: Saves your work to MongoDB. If MongoDB is not running locally, it gracefully switches to session-based in-memory storage so the app remains fully functional.
- **📄 Document Export**: Compile and download complete reports containing metadata, transcripts, and generated stories as formatted PDF or JSON files.
<img width="1915" height="984" alt="Screenshot 2026-06-10 121439" src="https://github.com/user-attachments/assets/a0f7090f-90e3-420a-9e46-70f184a5b0e8" />



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
<img width="1917" height="954" alt="Screenshot 2026-06-10 122636" src="https://github.com/user-attachments/assets/b1e1c328-6f5a-4128-9bf8-82481d8cf1a2" />
<img width="1904" height="922" alt="Screenshot 2026-06-10 122624" src="https://github.com/user-attachments/assets/d163e9c4-7378-4f08-a5db-0ebdad3c85b4" />
<img width="1917" height="944" alt="Screenshot 2026-06-10 122831" src="https://github.com/user-attachments/assets/91a931c2-30bf-40d6-9841-884d8ab3a54f" />
<img width="1919" height="899" alt="Screenshot 2026-06-10 122840" src="https://github.com/user-attachments/assets/d3769c05-ef24-495e-b298-2b9d317b37c2" />
<img width="1919" height="950" alt="Screenshot 2026-06-10 123007" src="https://github.com/user-attachments/assets/3819d584-d521-4dc1-bc98-db23d3148c44" />
<img width="1919" height="959" alt="Screenshot 2026-06-10 123041" src="https://github.com/user-attachments/assets/1f010f6f-985a-4616-815c-bc9393fb4b9a" />
output
[Bol Do Na_report.pdf](https://github.com/user-attachments/files/28784222/Bol.Do.Na_report.pdf)
[Bol Do Na_transcript.txt](https://github.com/user-attachments/files/28784224/Bol.Do.Na_transcript.txt)


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
The frontend will run on **`http://localhost:5173/`**.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.
