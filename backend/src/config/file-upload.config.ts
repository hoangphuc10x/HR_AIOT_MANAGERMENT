import { BadRequestException } from '@nestjs/common';

export const imageMulterConfig = {
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/^image\/(jpg|jpeg|png)$/)) {
      return callback(
        new BadRequestException('Allowed file type: file jpg, jpeg, png'),
      );
    }
    callback(null, true);
  },
};
