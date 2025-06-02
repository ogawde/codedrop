const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
const port = 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());

app.get('/check-gemini', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = 'Say hello in one word';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({
      status: 'success',
      message: 'Gemini API is working',
      response: text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gemini API is not working',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/', (req, res) => {
  res.send('Gemini API Health Checker - Visit /check-gemini to test');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Test Gemini API at http://localhost:${port}/check-gemini`);
});