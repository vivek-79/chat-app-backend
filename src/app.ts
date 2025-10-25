import express from 'express'
import { createServer } from 'http';
import { Server } from 'socket.io'
import Cors from 'cors'

const app = express();


app.use(express.json());
app.use(Cors({
    origin:'*',
    methods:['GET','POST','PUT','DELETE']
}))

// Create HTTP server from express app
export const server = createServer(app);

// Pass the server to socket.io
export const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
    transports: ["websocket"],
});



// Routes
import { authRoute } from './routes/auth.route'
import { userRoute } from './routes/user.route';
import { chatRoute } from './routes/chat.routes';
import { registerSocketHandlers } from './utils/socket';



app.use('/auth',authRoute)
app.use('/user',userRoute)
app.use('/chat',chatRoute)


//socket handlers
registerSocketHandlers(io)

// Global error handler
app.use((err: any, req: express.Request, res: express.Response) => {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Internal server error' });
});
