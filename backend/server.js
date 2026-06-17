import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import { GoogleGenAI } from '@google/genai';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables relative to current file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voice-to-story';
let isMongoConnected = false;
let inMemoryHistory = [];

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    isMongoConnected = true;
    console.log('MongoDB connected successfully');
  } catch (err) {
    isMongoConnected = false;
    console.error('MongoDB connection error. Falling back to IN-MEMORY storage:', err.message || err);
  }
}

connectDB();

// Add error listener to avoid unhandled rejection crashes on DB connection failure
mongoose.connection.on('error', err => {
  console.error('Mongoose connection event error:', err);
});

// MongoDB Schema
const ConversationSchema = new mongoose.Schema({
  fileName: { type: String, default: 'Voice-to-Story' },
  transcriptionMethod: { type: String, default: 'Gemini API' },
  rawTranscript: { type: String, default: '' },
  segments: [{
    speaker: { type: String, required: true },
    text: { type: String, required: true },
    emotion: { type: String, default: 'Neutral' }
  }],
  storyText: { type: String, default: '' },
  storyStyle: { type: String, default: 'Narrative Short Story' },
  customPrompt: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

// Configure Multer for in-memory file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Helper for calling Gemini with retry and fallback models on 503 errors
async function generateContentWithFallback(ai, options) {
  const models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'];
  let lastError;

  for (const model of models) {
    let attempts = 2;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        console.log(`Calling Gemini API using model ${model} (attempt ${attempt}/${attempts})...`);
        const response = await ai.models.generateContent({
          ...options,
          model: model
        });
        console.log(`Success using model ${model}`);
        return response;
      } catch (err) {
        lastError = err;
        console.warn(`Error using model ${model} (attempt ${attempt}/${attempts}):`, err.message || err);
        
        // Fast-fail on client/auth errors (e.g. invalid API key 400)
        const status = err.status || (err.response && err.response.status) || 0;
        const msg = (err.message || '').toLowerCase();
        if (status === 400 || msg.includes('api key not valid') || msg.includes('key_invalid') || msg.includes('apikey')) {
          throw err;
        }

        if (attempt < attempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  }

  throw lastError;
}

// Helpers
function cleanJsonResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

function parseAndValidateSegments(rawText) {
  const cleaned = cleanJsonResponse(rawText);
  let data;
  
  try {
    data = JSON.parse(cleaned);
  } catch (err) {
    // Attempt parsing using regex list match
    const listMatch = cleaned.match(/\[\s*\{.*\}\s*\]/s);
    if (listMatch) {
      try {
        data = JSON.parse(listMatch[0]);
      } catch (e) {}
    }
    
    if (!data) {
      const dictMatch = cleaned.match(/\{\s*".*"\s*:\s*.*\}/s);
      if (dictMatch) {
        try {
          data = JSON.parse(dictMatch[0]);
        } catch (e) {}
      }
    }
  }

  if (!data) {
    throw new Error('Failed to parse transcription JSON response.');
  }

  // If it's wrapped in a parent dict key
  if (!Array.isArray(data) && typeof data === 'object') {
    let listFound = null;
    for (const val of Object.values(data)) {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
        listFound = val;
        break;
      }
    }
    data = listFound ? listFound : [data];
  }

  if (!Array.isArray(data)) {
    throw new Error('Transcription response was not in a list format.');
  }

  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      return {
        speaker: String(item.speaker || 'Unknown'),
        text: String(item.text || item.dialogue || item.words || ''),
        emotion: String(item.emotion || item.tone || item.sentiment || 'Neutral')
      };
    } else {
      return {
        speaker: 'Speaker',
        text: String(item),
        emotion: 'Neutral'
      };
    }
  }).filter(seg => seg.text.length > 0);
}

// Routes

// 1. Fetch historical logs
app.get('/api/history', async (req, res) => {
  try {
    if (isMongoConnected) {
      const logs = await Conversation.find().sort({ createdAt: -1 });
      res.json(logs);
    } else {
      const logs = [...inMemoryHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json(logs);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transcription history logs' });
  }
});

// 2. Save conversation state
app.post('/api/history', async (req, res) => {
  try {
    if (isMongoConnected) {
      const newLog = new Conversation(req.body);
      const saved = await newLog.save();
      res.status(201).json(saved);
    } else {
      const newLog = {
        _id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
        fileName: req.body.fileName || 'Voice-to-Story',
        transcriptionMethod: req.body.transcriptionMethod || 'Gemini API',
        rawTranscript: req.body.rawTranscript || '',
        segments: req.body.segments || [],
        storyText: req.body.storyText || '',
        storyStyle: req.body.storyStyle || 'Narrative Short Story',
        customPrompt: req.body.customPrompt || '',
        createdAt: new Date()
      };
      inMemoryHistory.push(newLog);
      res.status(201).json(newLog);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to save log details to database' });
  }
});

// 3. Delete conversation log
app.delete('/api/history/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      await Conversation.findByIdAndDelete(req.params.id);
      res.json({ message: 'Log deleted successfully' });
    } else {
      const initialLength = inMemoryHistory.length;
      inMemoryHistory = inMemoryHistory.filter(item => item._id !== req.params.id);
      if (inMemoryHistory.length === initialLength) {
        return res.status(404).json({ error: 'Log not found' });
      }
      res.json({ message: 'Log deleted successfully (in-memory)' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete conversation log' });
  }
});

// 4. Gemini Direct Audio Transcription Endpoint
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const apiKey = req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(401).json({ error: 'Gemini API Key is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    // Determine MIME Type based on file buffer / file extension
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    let mimeType = 'audio/mpeg';
    if (ext === 'wav') mimeType = 'audio/wav';
    else if (ext === 'mp3') mimeType = 'audio/mp3';
    else if (ext === 'mpeg' || ext === 'mpg' || ext === 'mp2') mimeType = 'audio/mpeg';
    else if (ext === 'm4a' || ext === 'aac') mimeType = 'audio/aac';
    else if (ext === 'flac') mimeType = 'audio/flac';
    else if (ext === 'ogg') mimeType = 'audio/ogg';
    else if (ext === 'webm') mimeType = 'audio/webm';
    else if (ext === 'mp4') mimeType = 'audio/mp4';

    // Convert file buffer to Base64 representation
    const base64Data = req.file.buffer.toString('base64');

    // Initialize Gemini SDK
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    You are a speech-to-text analyzer. 
    Please transcribe the uploaded audio recording and identify speakers based on their vocal turns (e.g. Speaker 1, Speaker 2, etc.).
    For each speaker segment:
    1. Identify who is speaking (e.g. Speaker 1, Speaker 2).
    2. Write their exact spoken words.
    3. Detect their tone/emotion from the following list: Happy, Sad, Neutral, Angry, Excited.
    
    Output your response EXACTLY as a raw JSON array of objects, with NO Markdown enclosing backticks (no \`\`\`json). The structure MUST be:
    [
      {
        "speaker": "Speaker Name",
        "text": "spoken words",
        "emotion": "Detected Emotion"
      }
    ]
    `;

    const response = await generateContentWithFallback(ai, {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            }
          ]
        }
      ]
    });

    const segments = parseAndValidateSegments(response.text);
    const rawTranscript = segments.map(s => `${s.speaker}: ${s.text}`).join('\n');

    res.json({ segments, rawTranscript });

  } catch (err) {
    console.error('Transcription API Error:', err);
    res.status(500).json({ error: err.message || 'Error executing transcription.' });
  }
});

// 5. Generate Story Endpoint
app.post('/api/story', async (req, res) => {
  try {
    const apiKey = req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(401).json({ error: 'Gemini API Key is required.' });
    }

    const { segments, storyStyle, customPrompt } = req.body;
    if (!segments || !Array.isArray(segments)) {
      return res.status(400).json({ error: 'Dialogue segments array is required.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const fullPrompt = `
    Style Format: ${storyStyle}
    Writing Instructions: ${customPrompt}
    
    Dialogue Segments to write:
    ${JSON.stringify(segments, null, 2)}
    `;

    const response = await generateContentWithFallback(ai, {
      contents: fullPrompt
    });

    res.json({ storyText: response.text });

  } catch (err) {
    console.error('Story Generation API Error:', err);
    res.status(500).json({ error: err.message || 'Error generating creative content.' });
  }
});

// 6. PDF Report Compilation Route
app.post('/api/pdf', (req, res) => {
  try {
    const { segments, storyText, fileName, method } = req.body;
    if (!segments || !storyText) {
      return res.status(400).json({ error: 'Missing segments or storyText to compile report.' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=voice_to_story_report.pdf');
    doc.pipe(res);

    // Dark slate blue band header
    doc.rect(0, 0, 612, 80).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(14).text('VOICE-TO-STORY GENERATOR REPORT', 50, 32, { align: 'center', width: 512 });
    doc.moveDown(3);

    // Section 1: Metadata
    doc.fillColor('#0ea5e9').fontSize(13).text('1. Executive Summary & Document Metadata');
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y + 4).lineTo(562, doc.y + 4).stroke();
    doc.moveDown(1);

    doc.fillColor('#334155').fontSize(9.5);
    doc.text(`Original File Name: ${fileName || 'Voice-to-Story'}`);
    doc.text(`Transcription Method: ${method || 'Gemini API'}`);
    doc.text(`Total Dialogue Turns: ${segments.length}`);
    doc.moveDown(2);

    // Section 2: Narrative
    doc.fillColor('#0ea5e9').fontSize(13).text('2. Generated Story / Article Content');
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y + 4).lineTo(562, doc.y + 4).stroke();
    doc.moveDown(1);

    doc.fillColor('#1e293b').fontSize(10.5).text(storyText, { align: 'justify', lineGap: 3 });
    doc.moveDown(2);

    // Section 3: Dialogue
    doc.fillColor('#0ea5e9').fontSize(13).text('3. Reconstructed Dialogue Transcript');
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y + 4).lineTo(562, doc.y + 4).stroke();
    doc.moveDown(1);

    for (const turn of segments) {
      doc.fillColor('#0f172a').fontSize(9.5).text(`[${turn.speaker}] - Emotion: ${turn.emotion}`, { underline: true });
      doc.fillColor('#475569').fontSize(9).text(turn.text);
      doc.moveDown(0.7);
    }

    doc.end();

  } catch (err) {
    console.error('PDF Generation Error:', err);
    res.status(500).json({ error: 'Failed to build PDF report document.' });
  }
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
