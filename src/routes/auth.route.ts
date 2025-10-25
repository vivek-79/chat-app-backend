import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/AsyncHandler";




export const authRoute = Router();

authRoute.post('/login',asyncHandler(login));
// authRoute.post('/verify',asyncHandler(verifyOtp));