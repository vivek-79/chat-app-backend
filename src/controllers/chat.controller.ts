import { Response } from "express"
import { prisma } from "../utils/prisma";
import { CustomRequest } from "../../types";
import { redis } from '../utils/redis'



export const getChats = async (req: CustomRequest, res: Response) => {

    const userId = req.user?.id;

    if (!userId) {
        return res.status(404).json({
            ok: false,
            message: 'Please login to start chats'
        })
    }

    const chats = await prisma.chat.findMany({
        where: {
            members: {
                some: {
                    id: userId
                }
            }
        },
        select: {
            id: true,
            members: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    publicKey:true
                }
            }
        }
    })

    return res.status(200).json({
        ok: true,
        message: 'Chats fetched successfully',
        chats
    })
}

export const createNewChat = async (req: CustomRequest, res: Response) => {


    try {

        const { userId } = req.body;
        const user = req?.user;

        if (!user?.id) {
            return res.status(404).json({
                ok: false,
                message: 'Please login to start chats'
            })
        }

        if (!userId) {

            return res.status(400).json({
                ok: false,
                message: 'User is required to create chat'
            })
        }
        const { id } = user;

        const otherUser = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!otherUser) {
            return res.status(403).json({
                ok: false,
                message: 'User is not a whatsApp user'
            })
        }

        // Prevent self-chat
        if (otherUser.id === id) {
            return res.status(400).json({
                ok: false,
                message: "You cannot start a chat with yourself.",
            });
        }

        // checking chat exist

        const existingChat = await prisma.chat.findFirst({
            where: {
                isGroup: false,
                AND: [
                    { members: { some: { id } } },
                    { members: { some: { id: otherUser.id } } }
                ]
            },
            select: {
                id: true,
                members: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });

        if (existingChat) {
            return res.status(200).json({
                ok: true,
                message: "Chat already exists.",
                chat: existingChat,
            });
        }


        // Create a new chat
        const newChat = await prisma.chat.create({
            data: {
                isGroup: false,
                members: {
                    connect: [{ id }, { id: otherUser.id }],
                },
            },
            select: {
                id: true,
                members: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        publicKey: true
                    }
                }
            }
        });

        return res.status(201).json({
            ok: true,
            message: "New chat created successfully.",
            chat: newChat,
        });
    } catch (error) {
        console.error("Error creating new chat:", error);
        return res.status(500).json({
            ok: false,
            message: "Internal server error while creating chat.",
        });
    }
}

export const checkAppUser = async (req: CustomRequest, res: Response) => {


    const data = req.body;

    console.log(data)
    if (!data.contacts || data.contacts.length === 0) {

        return res.status(401).json({
            ok: false,
            message: 'No contacts found'
        })
    }

    const { contacts } = data;

    const formattedContacts = contacts.map((cnt: string) => {
        return cnt.startsWith('+91') ? cnt.slice(3).trim() : cnt;
    })

    console.log(formattedContacts);

    return res.status(200).json({ ok: true })

}

export const getRandomUsers = async (req: CustomRequest, res: Response) => {



    const { pageNumber, pageSize } = req.query;

    const redisClient = await redis();

    const activeKeys = await redisClient.keys('active-user:*')

    // Fetch all active users from Redis
    const userIds = activeKeys.map((key) => {

        return key.split(':')[1];
    })


    const totalActive = userIds.length;
    const PAGE_SIZE = pageSize ? +pageSize : 20;
    const PAGE_NUMBER = pageNumber ? +pageNumber : 1;
    const skip = (PAGE_NUMBER - 1) * PAGE_SIZE;

    // Get a slice for pagination (if more than 20 active users)
    const paginatedActiveUserIds = userIds.slice(skip, skip + PAGE_SIZE);

    const activeUsers = await prisma.user.findMany({
        where: {
            id: {
                in: paginatedActiveUserIds
            }
        },
        select: {
            id: true,
            name: true,
            avatar: true,
            //bio:true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Add custom field
    const usersWithExtraField = activeUsers?.map((user:any) => ({
        ...user,
        isOnline: true,
    }))

    // If active users are fewer than required, fill remaining slots
    if (usersWithExtraField.length < PAGE_SIZE) {

        const remainingUsersLength = PAGE_SIZE - activeUsers.length;
        // 👉 Adjust skip for offline users relative to total offset
        const offlineSkip = Math.max(0, skip - totalActive);

        const remainingUsers = await prisma.user.findMany({
            where: {
                id: {
                    notIn: userIds
                }
            },
            select: {
                id: true,
                name: true,
                avatar: true,
                //bio:true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: remainingUsersLength,
            skip: offlineSkip
        })

        const remainingUsersWithExtraField = remainingUsers.map((user:any) => ({
            ...user,
            isOnline: false
        }))
        usersWithExtraField.push(...remainingUsersWithExtraField);
    }


    if (!activeUsers || activeUsers.length == 0) {
        return res.status(200).json({
            ok: true,
            message: 'Users fetched successfully',
            activeUsers: []
        })
    }

    return res.status(200).json({
        ok: true,
        message: 'Users fetched successfully',
        usersWithExtraField
    })

}

export const getChatMessages = async (req: CustomRequest, res: Response) => {


    const { chatId, pageNumber, pageSize } = req.query;

    const PAGE_NUMBER = pageNumber ? +pageNumber : 1
    const PAGE_SIZE = pageSize ? +pageSize : 20
    const SKIP = (PAGE_NUMBER - 1) * PAGE_SIZE

    if (!chatId) {
        return res.status(401).json({
            ok: false,
            message: 'Chat Id not found'
        })
    }

    const messages = await prisma.message.findMany({
        where: {
            chatId: String(chatId)
        },
        select: {
            id: true,
            cipherText: true,
            iv:true,
            encryptedKeyForReceiver:true,
            encryptedKeyForSender:true,
            type: true,
            createdAt: true,
            updatedAt: true,
            sender: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                }
            }
        },
        skip: SKIP,
        take: PAGE_SIZE,
        orderBy: {
            createdAt: 'desc'
        }
    })

    if (messages.length === 0) {
        return res.status(200).json({
            ok: true,
            message: 'No chats available',
            messages: []
        })
    }

    return res.status(200).json({
        ok: true,
        message: 'No chats available',
        messages
    })
}