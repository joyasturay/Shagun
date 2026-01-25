"use server"
import prisma from "@/db/lib/prisma";
import { revalidatePath } from "next/cache";

export async function stashGift(batchId: string, imageURL: string) {
    try {
        const gift = await prisma.gift.create({
            data: {
                batchId: batchId,
                imageUrl: imageURL,
                status:"UNPROCESSED"
            }
        })
        revalidatePath('/dashboard/collector')
        return {success:true,giftId:gift.id}
    } catch (err) {
        console.log(err)
        return { success: false, error: "Database save failed" }
    }
}
