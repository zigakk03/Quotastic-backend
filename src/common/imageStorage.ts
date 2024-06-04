const FileType = import('file-type');
import fs from 'fs';
import { diskStorage, Options } from 'multer';
import { extname } from 'path';
import { Logger } from '@nestjs/common';

type validFileExtensionsType = 'png' | 'jpg' | 'jpeg';
type validMineType = 'image/png' | 'image/jpg' | 'image/jpeg';

const validFileExtensions: validFileExtensionsType[] = ['png', 'jpg', 'jpeg'];
const validMineTypes: validMineType[] = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];

export const saveImageToStorage: Options = {
  storage: diskStorage({
    destination: './files',
    filename(req, file, callback) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

      const ext = extname(file.originalname);

      const filename = `${uniqueSuffix}${ext}`;

      callback(null, filename);
    },
  }),
  fileFilter(req, file, callback) {
    const allowedMimeTypes: validMineType[] = validMineTypes;
    allowedMimeTypes.includes(file.mimetype as validMineType)
      ? callback(null, true)
      : callback(null, false);
  },
};

export const isFileExtensionSafe = async (
  fullFilePath: string,
): Promise<boolean> => {
  return (await FileType)
    .fileTypeFromFile(fullFilePath)
    .then((fileExtentionAndMimeType) => {
      if (!fileExtentionAndMimeType?.ext) {
        return false;
      }

      const isFileTypeLegit = validFileExtensions.includes(
        fileExtentionAndMimeType.ext as validFileExtensionsType,
      );
      const isMimeTypeLegit = validMineTypes.includes(
        fileExtentionAndMimeType.mime as validMineType,
      );
      const isFileLegit = isFileTypeLegit && isMimeTypeLegit;
      return isFileLegit;
    });
};

export const removeFile = (fullFilePath: string): void => {
  try {
    fs.unlinkSync(fullFilePath);
  } catch (error) {
    Logger.error(error);
  }
};
