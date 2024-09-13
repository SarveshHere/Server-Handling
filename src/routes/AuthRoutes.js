import express from 'express';
import { startSlackAuth, handleSlackAuthRedirect, createSession } from "../controllers/AuthController.js";

const router = express.Router();

router.post('/session', createSession);
router.get('/slack/start', startSlackAuth);
router.get('/slack/callback', handleSlackAuthRedirect);
router.get('/slack/success',function(req,res){
    res.send("Close the Window");
})



export default router;