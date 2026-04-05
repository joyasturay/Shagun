"use server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "../lib/auth";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getPreSignedURL(fileType: string, fileSize: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authorised" };
    const fileKey = `gifts/${session.user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileType.split("/")[1]}`;
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
            Key: fileKey,
            ContentType: fileType,
            ContentLength: fileSize,
        });
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
        return { signedUrl, fileKey };
    } catch (err) {
        return { error:"Error while uploading"}
    }
}
