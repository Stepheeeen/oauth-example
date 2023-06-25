import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";
import moment from "moment";
import { cookies } from "next/headers";
import Home from "../page";


const prisma = new PrismaClient();
// db collections
const Users = prisma.user;

export default async function Profile() {
    // get token from cookie
    const cookiesStore = cookies()
    const token = cookiesStore.get('token')?.value
    // decode the token
    const tokenDetails = jwt.verify(token as string, process.env.JWT_SECRET as string);
    const expirationTime = moment.unix((tokenDetails as any).exp);
    const currentTime = moment();
    if (currentTime.isAfter(expirationTime)) {
        // redirect to homepage
        return <Home />;
    }
    const userId = Number(tokenDetails.sub);
    const user = await Users.findUnique({
        where: {
            id: userId
        }
    });
    return (
        <div className='flex-column p-5 justify-center'>
            <div className="flex p-3">
                <span className="pe-2">Name:</span>
                <span>{user?.name}</span>
            </div>
            <div className="flex p-3">
                <span className="pe-2">Email:</span>
                <span>{user?.email}</span>
            </div>
        </div>
    )
}