
import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Check for necessary environment variables
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

if (!publicKey || !privateKey || !urlEndpoint) {
  console.error("ImageKit environment variables are not set correctly.");
  console.error(`publicKey found: ${!!publicKey}`);
  console.error(`privateKey found: ${!!privateKey}`);
  console.error(`urlEndpoint found: ${!!urlEndpoint}`);
}

const imageKit = new ImageKit({
    publicKey: publicKey!,
    privateKey: privateKey!,
    urlEndpoint: urlEndpoint!,
});

export async function GET(request: Request) {
    if (!publicKey || !privateKey || !urlEndpoint) {
        return NextResponse.json(
            { message: "ImageKit server configuration is incomplete." },
            { status: 500 }
        );
    }

    try {
        const authenticationParameters = imageKit.getAuthenticationParameters();
        return NextResponse.json(authenticationParameters);
    } catch (error) {
        console.error("Error getting ImageKit authentication parameters:", error);
        return NextResponse.json(
            { message: "Failed to authenticate with ImageKit" },
            { status: 500 }
        );
    }
}
