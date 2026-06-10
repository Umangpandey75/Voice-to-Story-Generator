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
VOICE TO STORY GENERATOR REPORT
====================================
Metadata:
- Source File: Bol Do Na.mp3.mp3
- Transcription: Gemini API
- Date Created: 10/06/2026

Generated Story:
----------------
The city lights blurred into streaks of gold and crimson as Rohan looked at Anya, his heart a drum against his ribs. They sat on the old, familiar bench by the lake, the cool evening breeze rustling the leaves above them. He took her hand, his thumb tracing the soft curve of her knuckles, and a deep sigh escaped him.

"Itni mohabbat karo na," he began, his voice a soft, almost reverent whisper, "Main doob na jaaun kahin." He smiled, a hint of apprehension mixing with his adoration. "Wapas kinare pe aana, main bhool na jaaun kahin." He chuckled softly, but his eyes were serious, reflecting the depth of his feelings. "Dekha jab se chehra tera, main toh hafton se soya nahi." It was true; her image had imprinted itself onto his waking thoughts and restless dreams.

He squeezed her hand gently, his gaze unwavering, trying to coax the unspoken words from her. "Bol do na zara," he pleaded, his voice earnest. "Dil mein jo hai chhupa." He leaned closer, his promise clear in his eyes. "Main kisi se kahunga nahi." He repeated it, a steadfast vow. "Bol do na zara, dil mein jo hai chhupa, main kisi se kahunga nahi. Main kisi se kahunga nahi."

A shadow fell over his face, and his earlier playfulness dissolved into a profound vulnerability. His grip on her hand tightened, almost desperately. "Mujhe neend aati nahi hai akele," he confessed, a raw, quiet sadness in his tone. "Khwabon mein aaya karo." He looked at her, his dependence stark. "Nahi chal sakunga tumhare bina main, mera tum sahara bano." It was more than just love; it was a plea for partnership, for an anchor in his world.

Then, a resolute strength returned to his features, chasing away the fleeting melancholy. "Ek tumhe chaahne ke alawa," he declared, his voice firm with conviction, "Aur kuch humse hoga nahi." His purpose was singular, unwavering. And once more, the request, softened by affection but imbued with an undying hope. "Bol do na zara, dil mein jo hai chhupa, main kisi se kahunga nahi. Bol do na zara, dil mein jo hai chhupa, main kisi se kahunga nahi. Main kisi se kahunga nahi."

He gazed out at the shimmering lake, a distant, pensive look in his eyes, as if seeing a future yet to unfold. A wistful melancholy crept into his voice again. "Hamari kami tumko mehsoos hogi," he murmured, "Bhiga dengi jab barishen." He turned back to her, his eyes brimming with unspoken emotions. "Mai bharkar ke laaya hu aankhon mein apni, adhoori si kuch khwahishen."

He gently cupped her face in his hands, his touch tender, his expression profound. "Rooh se chaahne wale aashiq," he stated, his voice resonating with deep conviction, "Baatein jismon ki karte nahi." His love was pure, unblemished, seeking only connection of spirit. And in the quiet hum of the evening, his voice rose one last time, a fervent appeal, a hope echoing across the lake. "Bol do na zara, dil mein jo hai chhupa, main kisi se kahunga nahi. Bol do na zara, dil mein jo hai chhupa, main kisi se kahunga nahi. Main kisi se kahunga nahi."

Dialogue Script:
----------------
[Speaker 1] (Neutral): Itni mohabbat karo na
[Speaker 1] (Neutral): Main doob na jaaun kahin
[Speaker 1] (Neutral): Wapas kinare pe aana
[Speaker 1] (Neutral): Main bhool na jaaun kahin
[Speaker 1] (Neutral): Dekha jab se chehra tera
[Speaker 1] (Neutral): Main toh hafton se soya nahi
[Speaker 1] (Neutral): Bol do na zara
[Speaker 1] (Neutral): Dil mein jo hai chhupa
[Speaker 1] (Neutral): Main kisi se kahunga nahi
[Speaker 1] (Neutral): Bol do na zara
[Speaker 1] (Neutral): Dil mein jo hai chhupa
[Speaker 1] (Neutral): Main kisi se kahunga nahi
[Speaker 1] (Neutral): Main kisi se kahunga nahi
[Speaker 1] (Sad): Mujhe neend aati nahi hai akele
[Speaker 1] (Sad): Khwabon mein aaya karo
[Speaker 1] (Sad): Nahi chal sakunga tumhare bina main
[Speaker 1] (Sad): Mera tum sahara bano
[Speaker 1] (Neutral): Ek tumhe chaahne ke alawa
[Speaker 1] (Neutral): Aur kuch humse hoga nahi
[Speaker 1] (Neutral): Bol do na zara
[Speaker 1] (Neutral): Dil mein jo hai chhupa
[Speaker 1] (Neutral): Main kisi se kahunga nahi
[Speaker 1] (Neutral): Bol do na zara
[Speaker 1] (Neutral): Dil mein jo hai chhupa
[Speaker 1] (Neutral): Main kisi se kahunga nahi
[Speaker 1] (Neutral): Main kisi se kahunga nahi
[Speaker 1] (Sad): Hamari kami tumko mehsoos hogi
[Speaker 1] (Sad): Bhiga dengi jab barishen
[Speaker 1] (Sad): Mai bharkar ke laaya hu aankhon mein apni
[Speaker 1] (Sad): Adhoori si kuch khwahishen
[Speaker 1] (Neutral): Rooh se chaahne wale aashiq
[Speaker 1] (Neutral): Baatein jismon ki karte nahi
[Speaker 1] (Neutral): Bol do na zara
[Speaker 1] (Neutral): Dil mein jo hai chhupa
[Speaker 1] (Neutral): Main kisi se kahunga nahi
[Speaker 1] (Neutral): Bol do na zara
[Speaker 1] (Neutral): Dil mein jo hai chhupa
[Speaker 1] (Neutral): Main kisi se kahunga nahi
[Speaker 1] (Neutral): Main kisi se kahunga nahi

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
