require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path'); // Path module for resolving file paths
const ejs = require('ejs'); // Correct path for requiring EJSn
const bodyParser = require('body-parser');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Set the views directory for EJS templates
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/home', (req, res) => {
  res.render("home");
});

const apiKey = process.env.API_KEY; 
// Route to handle form submission
app.post('/generate-questions', async (req, res) => {
  const { topic, number, type, complexity, example } = req.body;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  const data = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `Give me ${number} ${type} questions about ${topic} in physics. On a scale from 1 to 5, the complexity of questions should be ${complexity}. Here is an example question: ${example}. Add inline latex for math expressions, symbols and numbers which could be loaded using mathjax cdn. Make sure you respond as html list items only` }
        ]
      }
    ]
  };

  const jsonData = JSON.stringify(data);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: jsonData
    });

    const responseData = await response.json();
    const generatedText = responseData.candidates[0].content.parts[0].text;
  

    res.render('questions', {
      questions: generatedText,
      topic,
      number,
      type,
      complexity,
      example
  });
  } catch (error) {
    console.error(error);
    res.send('<b>An error occurred. Please try again later.</b>');
  }
});


const port = process.env.PORT || 3000; // Use port from environment variable or default to 3000




app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
