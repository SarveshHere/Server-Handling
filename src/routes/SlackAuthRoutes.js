import express from 'express';
import { startSlackAuth, handleSlackAuthRedirect, createSession, slackAuthSuccess } from "../controllers/SlackAuthController.js";

const router = express.Router();

router.post('/session', createSession);

router.get('/slack/start', startSlackAuth);

router.get('/slack/callback', handleSlackAuthRedirect);

router.get('/slack/success', slackAuthSuccess);

export default router;
