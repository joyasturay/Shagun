"use server"
import prisma from "@/db/lib/prisma"
import { auth } from "../lib/auth"
type subEventData = {
    name: string,
    Date:Date
}
type EventWithSubEvents = {
    Subevents: subEventData[]
}
type ActionState = {
    error?: string,
    success?: boolean,
    data?: EventWithSubEvents[]
}
export async function getAllEvents(_prevState: ActionState): Promise<ActionState>{
    const session = await auth()
    if (!session?.user?.id) {
        return {error:"Not authorised user"}
    }
    try {
        const res = await prisma.events.findMany({
            where: { userId: session.user.id },
            include: {
                Subevents: {
                    select: {
                        name: true,
                        Date:true
                   }
            }}
        })
        return {success:true,data:res}
    } catch (err) {
        console.log(err)
        return {error:"Error occurred while fetching details."}
    }
}