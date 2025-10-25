import { Server, Socket } from "socket.io";
import { redis } from "./redis";
import { saveMessageToDb } from "../controllers/ws.controller";
export const registerSocketHandlers = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log(`⚡ New socket connected: ${socket.id}`);

        // add user id to redis active-user list
        socket.on("setUserId", async (userId:string)=>{

            try {
                
                if(!userId) return ;

                socket.data.userId = userId;
                const redisClient = await redis();
                redisClient.set(`active-user:${userId}`,socket.id);

                console.log('userId saved to redis and socket :', userId)
            } catch (error) {
                console.log('Error while adding active user to redis :' , error)
            }
        })
    
        socket.on("sendText", async(data) => {
            
            const res = await saveMessageToDb(data);
            const redisClient = await redis();

            if(res){


                data.payload.id = res.id;
                data.payload.createdAt = res.createdAt;
                data.payload.updatedAt = res.updatedAt;

                const memberIds = res.chat.members;


                // Getting socket id from redis
                const activeUserSocketIds = (
                    await Promise.all(
                        memberIds.map(async (mem:any) => {
                            const socketId = await redisClient.get(`active-user:${mem.id}`);
                            return socketId || null;
                        })
                    )
                ).filter(Boolean) as string[];
                activeUserSocketIds.forEach((mem:any)=>{
                    io.to(mem).emit('newMessage',data)
                })
            }

        });

        // ✅ Example event: on disconnect
        socket.on("disconnect", async() => {
            console.log(`❌ Socket disconnected: ${socket.id}`);

            try {

                const userId = socket.data.userId;

                if (!userId) return;

                const redisClient = await redis();
                redisClient.del(`active-user:${userId}`);
                console.log('userId deleted from redis and socket :', userId)
                
            } catch (error) {
                console.log('Error while adding active user to redis :', error)
            }
        });
    });
};
