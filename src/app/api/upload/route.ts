import ImageKit from "imagekit";
import { NextResponse } from "next/server";
import { config } from 'dotenv';

config();

// The ImageKit client will now be initialized inside the POST handler
// to ensure environment variables are loaded.

export async function POST(req: Request) {
  try {
    // Initialize ImageKit inside the request handler
    const imagekit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
    });

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: '/evntos/',
      useUniqueFileName: true,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("ImageKit upload error:", err);
    
    // Provide a more specific error if credentials are missing
    if (err.message && err.message.includes("publicKey")) {
        return NextResponse.json({ error: "ImageKit configuration is missing. Please check your environment variables." }, { status: 500 });
    }

    return NextResponse.json({ error: err.message || "An unknown error occurred during upload." }, { status: 500 });
  }
}
