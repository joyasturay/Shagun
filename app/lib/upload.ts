import { getPreSignedURL } from "../actions/upload";
import imageCompression from "browser-image-compression";
export async function uploadImageToS3(file: File): Promise<string | null> {
  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/jpeg",
    });
    const { signedUrl, fileKey, error } = await getPreSignedURL(
      compressedFile.type,
      compressedFile.size,
    );

    if (error || !signedUrl) throw new Error(error || "Upload failed");
    const upload = await fetch(signedUrl, {
      method: "PUT",
      body: compressedFile,
      headers: { "Content-Type": compressedFile.type },
    });

    if (!upload.ok) throw new Error("S3 Upload failed");
    const publicUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileKey}`;

    return publicUrl;
  } catch (err) {
    console.error("Upload Error:", err);
    return null;
  }
}
