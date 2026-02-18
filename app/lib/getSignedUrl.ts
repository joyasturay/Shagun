import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "../lib/auth";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
export async function getReadSignedUrl(fileKey: string) {

  const cmd = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileKey,
  });
    const expiresIn = 60 * 60;
    const signedPublicUrl = await getSignedUrl(s3, cmd, { expiresIn })
    return {
    signedPublicUrl,
    expiresAt: Date.now() + expiresIn * 1000,
  };
}
