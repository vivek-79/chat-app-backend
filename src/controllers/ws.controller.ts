import { prisma } from '../utils/prisma'
import { MessageProps } from '../utils/types'


export const saveMessageToDb =async(message:MessageProps)=>{

    try {
        
        const {cipherText,iv,encryptedKeyForReceiver,encryptedKeyForSender,type,sender:{id:senderId}} = message.payload;
        const {chatId} = message;

        
        const newMessage = await prisma.message.create({
            data:{
                cipherText,
                iv,
                encryptedKeyForSender,
                encryptedKeyForReceiver,
                type,
                senderId,
                chatId,
            },
            select:{
                createdAt:true,
                id:true,
                updatedAt:true,
                chat:{
                    select:{
                        members:{
                            select:{
                                id:true
                            }
                        }
                    }
                }
            }
        })

        if(!newMessage) return false;

        return newMessage;

    } catch (error) {
        console.log('Error saving message')
        return false;
    }
}