
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken'
import { prisma } from '../utils/prisma'
import { env } from '../utils/Env';
import { redis } from '../utils/redis'
import { DetailsProp } from './types';

const cookieOptions = (day: number) => ({

    sameSite: process.env.NODE_ENV === 'dev' ? "lax" as "lax" : 'strict' as 'strict',
    maxAge: day * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
})

const getTokens = async (id: string, name: string) => {

    const { jwtSecret } = env;

    const accessToken = await sign(
        { id, name },
        jwtSecret,
        {
            algorithm: 'HS256',
            expiresIn: '1d'
        }
    )

    const refreshToken = await sign(
        { id, name },
        jwtSecret,
        {
            algorithm: 'HS256',
            expiresIn: '7d'
        }
    )

    return { accessToken, refreshToken };

}


export const login = async (req: Request, res: Response): Promise<Response> => {

    try {

        const details = req.body.details as DetailsProp;

        // Data validation
        if (!details || !details.phone || !details.id) {
            return res.status(400).json({
                ok: false,
                message: 'No number found'
            })
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                number: details.phone
            }
        })

        if (existingUser) {

            const { accessToken, refreshToken } = await getTokens(existingUser.id, existingUser.name);

            return res.status(201).
                cookie('accessToken', accessToken, cookieOptions(1)).
                cookie('refreshToken', refreshToken, cookieOptions(7)).
                json({
                    ok:true,
                    message: 'Account created successfully',
                    details: {
                        id: existingUser.id,
                        accessToken,
                        refreshToken,
                        img: existingUser.avatar
                    }
                })
        }

        const newUser = await prisma.user.create({
            data: {
                name: details.name ? details.name : '',
                number: details.phone,
                id: details.id,
                publicKey: details.publicKey,
                avatar: details.img ? details.img : ''
            }
        })


        const { accessToken, refreshToken } = await getTokens(newUser.id, newUser.name);

        return res.status(201).
            cookie('accessToken', accessToken, cookieOptions(1)).
            cookie('refreshToken', refreshToken, cookieOptions(7)).
            json({
                ok: true,
                message: 'Account created successfully',
                details: {
                    id: newUser.id,
                    accessToken,
                    refreshToken,
                    img:newUser.avatar
                }
            })

    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: 'Server please try again'
        })
    }
}


// export const verifyOtp = async (req: Request, res: Response): Promise<Response> => {

//     try {

//         const { otp, number } = req.body;
//         const client = await redis();
//         let user;

//         if (!number || !otp) {
//             return res.status(400).json({ ok: false, message: 'Number or OTP missing' });
//         }

//         // otp attempt limiter
//         const attemptsKey = `${number}-otp-attempts`
//         const attempts = await client.incr(attemptsKey);

//         if (attempts == 1) await client.expire(attemptsKey, 300);
//         if (attempts > 4) {
//             return res.status(429).json({ ok: false, message: "Too many attempts. Try later." });
//         }

//         const redisOtp = await client.get(`${number}-otp`);

//         if (!redisOtp) {
//             return res.status(403).json({
//                 ok: false,
//                 message: 'Otp expired request new'
//             })
//         }

//         const isCorrect = String(redisOtp) === String(otp);

//         if (!isCorrect) {
//             return res.status(401).json({
//                 ok: false,
//                 message: 'Wrong otp'
//             })
//         }

//         // delete otp

//         await client.del(`${number}-otp`);

//         // existing check
//         user = await prisma.user.findUnique({
//             where: {
//                 number
//             }
//         })

//         if (!user) {
//             user = await prisma.user.create({
//                 data: {
//                     number,
//                     publicKey: '334'
//                 }
//             })
//         }

//         if (!user) {
//             return res.status(500).json({
//                 ok: false,
//                 message: 'Server error please try again'
//             })
//         }

//         const { accessToken, refreshToken } = await getTokens(user.id, user.name);

//         return res.status(201)
//             .cookie('accessToken', accessToken, cookieOptions(1))
//             .cookie('refreshToken', refreshToken, cookieOptions(7))
//             .json({
//                 ok: true,
//                 message: 'user verified and created',
//                 accessToken,
//                 refreshToken
//             })

//     } catch (error) {
//         return res.status(500).json({
//             ok: false,
//             message: 'Server error please try again'
//         })
//     }

// }

