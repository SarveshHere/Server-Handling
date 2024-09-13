import axios from 'axios';
import { v4 as uuid } from "uuid";
import { io } from '../app.js';

let currentSession=null;

export const createSession = async (req, res) => {
  try {
    const sessionId = uuid();
    console.log(`Created session ID: ${sessionId}`);
    currentSession = sessionId;
    res.json({ sessionId });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const startSlackAuth = async (req, res) => {
  const { sessionId } = req.query;
  const scopes = 'channels:read,chat:write,im:read,groups:read,users:read';
  const redirectUrl = `https://slack.com/oauth/v2/authorize?client_id=${process.env.CLIENT_ID}&user_scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}`;
  res.redirect(redirectUrl);
};

export const handleSlackAuthRedirect = async (req, res) => {
  const { code, state } = req.query;
  
    try {
      const response = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        null,
        {
          params: {
            code,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: process.env.REDIRECT_URI, 
          },
        }
      );
     
      const updatedSession = {
        currentSession,
        userAccessToken: response.data.authed_user && response.data.authed_user.access_token,
        workspaceId: response.data.team.id,
        workspaceName: response.data.team.name
      };
      console.log(updatedSession);

      io.sockets.in(currentSession).emit('authSuccess', updatedSession);
      res.redirect(`${process.env.BASE_URL}/auth/slack/success`);
      // delete sessions[state];
    } catch (error) {
      console.error('Error during Slack OAuth exchange:', error);
      res.status(500).send('Authentication failed. Please try again.');
    }
};

