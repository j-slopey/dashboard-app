import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const app = express();
const port = 5000;

if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
  console.error('ERROR: SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is missing from .env');
} else {
  console.log('Spotify credentials loaded.');
}

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;

const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get('/auth/login', (req, res) => {
  const scope = "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state";
  const state = generateRandomString(16);

  const auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: "http://127.0.0.1:5000/auth/callback",
    state: state
  });

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
});

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  console.log('Received callback with code:', code);

  try {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('redirect_uri', 'http://127.0.0.1:5000/auth/callback');
    params.append('grant_type', 'authorization_code');

    console.log('Exchanging code for token...');
    const response = await axios.post('https://accounts.spotify.com/api/token', params, {
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 5000 // 5 second timeout
    });

    const access_token = response.data.access_token;
    console.log('Token obtained:', access_token ? 'Yes' : 'No');
    
    // Redirect back to React app with the token
    res.redirect('http://localhost:5173/?token=' + access_token);
  } catch (error) {
    console.error('Error getting token:', error.message);
    if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
    }
    res.status(500).send('Error getting token. Check server logs for details.');
  }
});

app.get('/auth/token', async (req, res) => {
  // Endpoint to refresh token if needed (simplified for now)
  res.json({ access_token: '' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Listening at http://0.0.0.0:${port}`);
});
