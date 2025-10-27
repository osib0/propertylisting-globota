import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { AwsCredentialIdentity } from "@aws-sdk/types";

// AWS Credentials validation
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const BUCKET_NAME = "royalrajasthantravel";

if (!accessKeyId || !secretAccessKey) {
  throw new Error(
    "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set in environment variables"
  );
}

// Initialize S3 client
export const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId,
    secretAccessKey,
  } as AwsCredentialIdentity,
});

// ---------------------------
// Upload file to public folder
// ---------------------------
export async function uploadToPublic(
  file: Buffer | Uint8Array | Blob | string | ReadableStream,
  fileName: string,
  type: string,
  folder: any = "public" // dynamic folder
) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${folder}/${fileName}`,
    Body: file,
    ContentType: type,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    return { Location: `https://${BUCKET_NAME}.s3.amazonaws.com/${params.Key}` };
  } catch (error) {
    console.error("Error uploading to public folder:", error);
    throw error;
  }
}

// ---------------------------
// Generate signed URL for S3 object
// ---------------------------
export async function getS3SignedUrl(key: string, expiresIn = 3600) {
  const params = { Bucket: BUCKET_NAME, Key: key };
  try {
    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
}

// ---------------------------
// Delete file from S3
// ---------------------------
export async function deleteFile(key: string) {
  try {
    const command = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    await s3.send(command);
    return { message: `File ${key} deleted successfully` };
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

// ---------------------------
// List files in folder
// ---------------------------
export async function listFiles(folder: string) {
  try {
    const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: `${folder}/` });
    const response = await s3.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
}
