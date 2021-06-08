import {JwtToken} from "../functions/auth/JwtToken";
import {decode} from "jsonwebtoken"

export function getUserId(bearer: string): string {
    const token = bearer.split(" ")[1]
    const decodedToken = decode(token) as JwtToken;

    return decodedToken.sub;
}