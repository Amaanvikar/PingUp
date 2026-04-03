import "dotenv/config";
import ImageKit from "imagekit";

let _client = null;

/**
 * Returns a shared ImageKit client. Call only when uploading (after env is loaded).
 * @throws {Error} if IMAGEKIT_* env vars are missing
 */
export function getImageKit() {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
        throw new Error(
            "ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env"
        );
    }

    if (!_client) {
        _client = new ImageKit({ publicKey, privateKey, urlEndpoint });
    }
    return _client;
}

export default getImageKit;
