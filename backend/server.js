const express = require('express');
const OpenAI = require('openai');

const app = express();
const port = Number(process.env.PORT) || 10000;
const maxMessages = 50;
const maxMessageLength = 8000;

app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));

app.get('/health', function (req, res) {
  res.status(200).json({ status: 'ok' });
});

app.post('/api/chat', async function (req, res) {
  const messages = req.body && req.body.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > maxMessages) {
    return res.status(400).json({ error: 'messages must be a non-empty array with at most 50 items.' });
  }

  const validMessages = messages.every(function (message) {
    return message &&
      (message.role === 'user' || message.role === 'assistant') &&
      typeof message.content === 'string' &&
      message.content.trim().length > 0 &&
      message.content.length <= maxMessageLength;
  });
  if (!validMessages) {
    return res.status(400).json({ error: 'Each message must have a user or assistant role and contain 1 to 8000 characters.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'The AI service is not configured.' });
  }
  if (!process.env.OPENAI_MODEL) {
    return res.status(503).json({ error: 'The AI model is not configured.' });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL,
      input: messages.map(function (message) {
        return { role: message.role, content: message.content };
      })
    });

    if (!response.output_text) {
      return res.status(502).json({ error: 'The AI service returned an empty response.' });
    }
    return res.status(200).json({ reply: response.output_text });
  } catch (error) {
    console.error('OpenAI request failed:', error.status || error.name || 'unknown error');
    return res.status(502).json({ error: 'The AI service request failed. Please try again.' });
  }
});

app.use(function (error, req, res, next) {
  if (error && error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }
  if (error instanceof SyntaxError && error.status === 400 && Object.prototype.hasOwnProperty.call(error, 'body')) {
    return res.status(400).json({ error: 'Request body must be valid JSON.' });
  }
  console.error('Request failed:', error && error.name ? error.name : 'unknown error');
  return res.status(500).json({ error: 'Internal server error.' });
});

app.listen(port, '0.0.0.0', function () {
  console.log('AI assistant backend listening on port ' + port);
});
