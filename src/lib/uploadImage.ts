import fs from 'fs';
import path from 'path';

/**
 * Base64 зургийг public/lotteryCars фолдер дээр хадгалах
 * @param base64String - Base64 формат зураг (data:image/jpeg;base64,...)
 * @param carId - Машины ID
 * @returns Зургийн зам (жишээ: /lotteryCars/1.jpg)
 */
export async function saveBase64Image(base64String: string, carId: number): Promise<string> {
  try {
    // Base64 header-г салгах
    const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Буруу base64 формат');
    }

    const imageType = matches[1]; // jpeg, png, etc
    const base64Data = matches[2];

    // Buffer руу хөрвүүлэх
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Файлын нэр ба зам
    const fileName = `${carId}.${imageType}`;
    const uploadDir = path.join(process.cwd(), 'public', 'lotteryCars');
    const filePath = path.join(uploadDir, fileName);

    // Folder байхгүй бол үүсгэх
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Файл хадгалах
    fs.writeFileSync(filePath, imageBuffer);

    // Public зам буцаах
    return `/lotteryCars/${fileName}`;
  } catch (error) {
    console.error('Image save error:', error);
    throw new Error('Зураг хадгалахад алдаа гарлаа');
  }
}

/**
 * Зургийг устгах
 * @param imagePath - Зургийн зам (жишээ: /lotteryCars/1.jpg)
 */
export function deleteImage(imagePath: string): void {
  try {
    if (!imagePath || !imagePath.startsWith('/lotteryCars/')) {
      return;
    }

    const filePath = path.join(process.cwd(), 'public', imagePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Image deleted:', imagePath);
    }
  } catch (error) {
    console.error('Image delete error:', error);
  }
}
