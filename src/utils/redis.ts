import { RedisClientType } from "redis";
import { createClient } from 'redis';
import { env } from "./Env";




declare global{
    var redis: ReturnType<typeof createClient> | undefined;
}


export const redis = async ()=>{

    const { redisPassword } = env;
    if(!globalThis.redis){
        
        const client = createClient({
            username: 'default',
            password: redisPassword,
            socket: {
                host: 'redis-19827.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
                port: 19827
            }
        });

        client.on('error', err => console.log('Redis Client Error', err));
        client.on('end', () => console.log('Redis disconnected'));
        client.on('reconnecting', () => console.log('Redis reconnecting'));
        
        await client.connect();

        globalThis.redis = client;

    }

    return globalThis.redis!;
}