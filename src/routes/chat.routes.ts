import { Router } from "express";
import { authMiddleWare } from "../middleware/auth.middleware";
import { checkAppUser, createNewChat, getChatMessages, getChats, getRandomUsers } from "../controllers/chat.controller";
import { asyncHandler } from "../utils/AsyncHandler";





export const chatRoute = Router();

chatRoute.use(authMiddleWare);

chatRoute.get('/', asyncHandler(getChats))
chatRoute.post('/newChat', asyncHandler(createNewChat));
chatRoute.post('/checkAppUser', asyncHandler(checkAppUser));
chatRoute.get('/randomUsers', asyncHandler(getRandomUsers));
chatRoute.get('/messages',asyncHandler(getChatMessages));
