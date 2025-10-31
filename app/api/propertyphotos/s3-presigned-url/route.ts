import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  const { propertyId, fileName, contentType } = await req.json();

  const fileKey = `public/${propertyId}/propertyPhotos/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: 'royalrajasthantravel',
    Key: fileKey,
    ContentType: contentType,
  });

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 1 min expiry
    return NextResponse.json({ url: signedUrl, key: fileKey }, { status: 200 });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return NextResponse.json({ error: "Could not generate URL" }, { status: 500 });
  }
}
