import { Router } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { checkAppUser } from "../controllers/chat.controller";




export const userRoute = Router();

userRoute.post('/checkAppUser', asyncHandler(checkAppUser));