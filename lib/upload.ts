import multer from "multer";
import sharp from "sharp";

export const uploadConfig = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, cb) => {
      // Generate unique filename
    },
  }),
});

export async function processImage(buffer: Buffer) {
  // Resize and optimize images with Sharp
}
