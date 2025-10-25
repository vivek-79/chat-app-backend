import { NextFunction, Response } from "express";
import  { JwtPayload, verify }  from 'jsonwebtoken' 
import { env } from "../utils/Env";
import { CustomRequest } from "../../types";



export const authMiddleWare = async(req: CustomRequest, res: Response, next: NextFunction) => {


    try {

        const header = req.headers.authorization;

        const token = header?.split(" ")[1];

        if(!token){

            console.log('No token')
            return res.status(401).json({
                ok: false,
                message: 'Unauthorized – No token provided.'
            })
        }
        const decoded = verify(token,env.jwtSecret,{
            algorithms:['HS256']
        }) as JwtPayload & { id?:string,phoneNumber?:string};

        console.log(decoded)
        if(!decoded?.id){
            console.log('No token user')
            return res.status(403).json({
                ok: false,
                message: 'Invalid AccessToken'
            })
        }

        req.user ={ id:decoded.id}

        next();
    } catch (error:any) {

        console.log('Error while authenticating :', error)

        if (error.name === "TokenExpiredError") {
            return res.status(403).json({
                ok: false,
                message: "Access token expired. Please renew it.",
            });
        }
        
        return res.status(500).json({
            ok: false,
            message: 'Internal server error try again.'
        })
    }

}