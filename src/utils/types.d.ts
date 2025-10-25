

export interface MessageProps{
    payload:{
        id: string,
        cipherText: string,
        iv: string,
        encryptedKeyForSender: string,
        encryptedKeyForReceiver: string,
        type: "TEXT" | "IMAGE" | "VIDEO",
        createdAt: Date,
        updatedAt: Date,
        sender: {
            id: string,
            name: string,
            avatar?: string
        }
    },
    chatId:string
}