import dotEnv from 'dotenv';
dotEnv.config();

export const env ={

    twilioSid: String(process.env.TWILIO_SID),
    twilioAuthToken: String(process.env.TWILIO_AUTH_TOKEN),

    jwtSecret: String(process.env.JWT_TOKEN_SECRET),
    redisPassword: String(process.env.REDIS_PASSWORD),
    firebaseJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON!
}