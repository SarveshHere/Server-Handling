import axios from 'axios';
import { v4 as uuid } from "uuid";
import querystring from "querystring"; 
import { io, sessions } from '../app.js';

export const createSession = async (req, res) => {

  const sessionId = uuid();
  sessions.set(sessionId, {});
  res.json({ sessionId });
  
};

export const startSlackAuth = async (req, res) => {

  const { sessionId } = req.query;
  try {

    if (!sessions.has(sessionId)) {
      return res.status(400).send('Invalid session ID');
    }
  
    const state = encodeURIComponent(JSON.stringify({
      sessionId
    }));
  
    const clientId = process.env.CLIENT_ID;
    const redirectUri = process.env.REDIRECT_URI;
    const userScope = sessions.get(sessionId).userScope;
  
    const queryString = querystring.stringify({
      user_scope: userScope,
      client_id: clientId,
      redirect_uri:redirectUri,
      state
    });
  
    const redirectUrl = `https://slack.com/oauth/v2/authorize?${queryString}`;
  
    res.redirect(redirectUrl);

  } catch (error) {

    console.error('Error in startSlackAuth:', error); 
    res.status(500).send('Internal Server Error');

  }

};

export const handleSlackAuthRedirect = async (req, res) => {

  const { code, state } = req.query;
  const { sessionId } = JSON.parse(decodeURIComponent(state));
  
  try {

    if (!sessions.has(sessionId)) {
      return res.status(400).send('Invalid session ID');
    }

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const redirectUri = process.env.REDIRECT_URI;

    const requestBody = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri
    };
  
    const requestOptions = {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: querystring.stringify(requestBody),
      url: "https://slack.com/api/oauth.v2.access"
    };

    const response = await axios(requestOptions);
     
    const responseToClient = {
      sessionId,
      userAccessToken: response.data.authed_user && response.data.authed_user.access_token,
      workspaceId: response.data.team.id,
      workspaceName: response.data.team.name
    };
    
    const socket = sessions.get(sessionId).socket;
    
    io.sockets.to(socket.id).emit('authSuccess', responseToClient);
    
    res.redirect(`${process.env.BASE_URL}/auth/slack/success`);

  } catch (error) {

    console.error('Error during Slack OAuth exchange:', error);
    res.status(500).send('Authentication failed. Please try again.');

  }

};