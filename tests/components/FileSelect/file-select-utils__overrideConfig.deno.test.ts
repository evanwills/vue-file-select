import { describe, it } from "jsr:@std/testing/bdd";
import { assertEquals } from 'jsr:@std/assert';
import { overrideConfig } from '../../../src/components/FileSelect/logic/file-select-utils.js';

const mockAcceptTypes = [
  {
    ext: 'doc',
    mime: 'application/msword',
    name: 'Old Microsoft Word',
    type: 'document',
  },
  {
    ext: 'docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    name: 'Microsoft Word',
    type: 'document',
  },
  {
    ext: 'jpeg',
    mime: 'image/jpeg',
    name: 'JPEG',
    type: 'image',
  },
  {
    ext: 'pdf',
    mime: 'application/pdf',
    name: 'PDF',
    type: 'document',
  },
  {
    ext: 'png',
    mime: 'image/png',
    name: 'PNG',
    type: 'image',
  },
  {
    ext: 'ppt',
    mime: 'application/vnd.ms-powerpoint',
    name: 'Powerpoint (old)',
    type: 'document',
  },
  {
    ext: 'pptx',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    name: 'Powerpoint',
    type: 'document',
  },
  {
    ext: 'rtf',
    mime: 'application/rtf',
    name: 'Rich Text Format',
    type: 'document',
  },
  {
    ext: 'svg',
    mime: 'image/svg+xml',
    name: 'SVG',
    type: 'image',
  },
  {
    ext: 'txt',
    mime: 'text/plain',
    name: 'Text',
    type: 'document',
  },
  {
    ext: 'webp',
    mime: 'image/webp',
    name: 'WebP',
    type: 'image',
  },
  {
    ext: 'xls',
    mime: 'application/vnd.ms-excel',
    name: 'Excel (old)',
    type: 'document',
  },
  {
    ext: 'xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    name: 'Excel',
    type: 'document',
  },
];

const mockOverride = {
  allowedTypes: [
    {
      ext: 'doc',
      mime: 'application/msword',
      name: 'Old Microsoft Word',
      type: 'document',
    },
    {
      ext: 'docx',
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      name: 'Microsoft Word',
      type: 'document',
    },
    {
      ext: 'jpeg',
      mime: 'image/jpeg',
      name: 'JPEG',
      type: 'image',
    },
    {
      ext: 'pdf',
      mime: 'application/pdf',
      name: 'PDF',
      type: 'document',
    },
    {
      ext: 'png',
      mime: 'image/png',
      name: 'PNG',
      type: 'image',
    },
  ],
  greyScale: false,
  jpegCompression: 0.85,
  logging: true,
  maxFileCount: 15,
  maxImgPx: 1500,
  maxSingleSize: '15MB',
  maxTotalSize: '45MB',
  omitInvalid: false,
  messages: {
    noResize: 'This browser does not support image resizing. '
      + 'Please use a supported browser like Chrome or Firefox.',
    tooBigFile: 'File size exceeds allowable limit. '
      + 'Individual files must be less than [[FILE_SIZE]] and [[MAX_TOTAL]] total '
      + 'for multiple files.',
    invalidType: 'We detected an invalid file type. '
      + 'Valid file types are: [[TYPE_LIST]]',
  },
};

const mockDefaultFileList = {
  allowedTypes: mockAcceptTypes,
  greyScale: true,
  jpegCompression: 0.9,
  maxFileCount: 10,
  maxImgPx: 2000,
  maxSingleSize: '4MB',
  maxTotalSize: '40MB',
  messages: {
    noResize: 'This browser does not support image resizing. '
      + 'Please use a supported browser like Chrome or Firefox.',
    tooBigFile: 'File size exceeds allowable limit.',
    tooBigTotal: 'Total size of upload exceeds allowable limit.',
    tooMany: 'Maximum number of files has been exceeded.',
    invalidType: 'We detected an invalid file type. '
      + 'Valid file types include, '
      + '.docx, .doc, .pdf, .jpg, .jpeg, .png.',
  },
};

const mockDefaultFileData = {
  allowedTypes: mockAcceptTypes,
  maxImgPx: 2000,
  maxSingleSize: '4MB',
};

const mockDefaultImage = {
  greyScale: false,
  jpegCompression: 0.75,
  maxImgPx: 2000,
  maxSingleSize: '4MB',
};

describe(
  'overrideConfig() returns an object with the same number of properties as the default',
  () => {
    it(
      'overrideConfig() returns an object with the same number of properties as `mockDefaultImage`',
      () => {
        const output = overrideConfig(mockDefaultImage, mockOverride);

        assertEquals(typeof output, 'object');
        assertEquals(Object.prototype.toString.call(output), '[object Object]');
        assertEquals(Object.keys(output).length, Object.keys(mockDefaultImage).length);
      },
    );

    it(
      'overrideConfig() returns an object with the same number of properties as `mockDefaultFileData`',
      () => {
        const output = overrideConfig(mockDefaultFileData, mockOverride);

        assertEquals(typeof output, 'object');
        assertEquals(Object.prototype.toString.call(output), '[object Object]');
        assertEquals(Object.keys(output).length, Object.keys(mockDefaultFileData).length);
      },
    );

    it(
      'overrideConfig() returns an object with the same number of properties as `mockDefaultFileList`',
      () => {
        const output = overrideConfig(mockDefaultFileList, mockOverride);

        assertEquals(typeof output, 'object');
        assertEquals(Object.prototype.toString.call(output), '[object Object]');
        assertEquals(Object.keys(output).length, Object.keys(mockDefaultFileList).length);
      },
    );
  },
);

describe(
  'overrideConfig() returns an object with the same properties as the original',
  () => {
    describe(
      'overrideConfig() returns an object with properties that match properties in mockDefaultImage',
      () => {
        it(
          '`output` object has property `greyScale` with the same type as the same property in `mockDefaultImage`',
          () => {
            const output = overrideConfig(mockDefaultImage, mockOverride);

            assertEquals(output.hasOwnProperty('greyScale'), true);
            assertEquals(typeof output.greyScale, typeof mockDefaultImage.greyScale);
            assertEquals(output.greyScale, mockOverride.greyScale);
          }
        );

        it(
          '`output` object has property `jpegCompression` with the same type as the same property in `mockDefaultImage`',
          () => {
            const output = overrideConfig(mockDefaultImage, mockOverride);

            assertEquals(output.hasOwnProperty('jpegCompression'), true);
            assertEquals(typeof output.jpegCompression, typeof mockDefaultImage.jpegCompression);
            assertEquals(output.jpegCompression, mockOverride.jpegCompression);
          }
        );

        it(
          '`output` object has property `maxImgPx` with the same type as the same property in `mockDefaultImage`',
          () => {
            const output = overrideConfig(mockDefaultImage, mockOverride);

            assertEquals(output.hasOwnProperty('maxImgPx'), true);
            assertEquals(typeof output.maxImgPx, typeof mockDefaultImage.maxImgPx);
            assertEquals(output.maxImgPx, mockOverride.maxImgPx);
          }
        );

        it(
          '`output` object has property `maxSingleSize` with the same type as the same property in `mockDefaultImage`',
          () => {
            const output = overrideConfig(mockDefaultImage, mockOverride);

            assertEquals(output.hasOwnProperty('maxSingleSize'), true);
            assertEquals(typeof output.maxSingleSize, 'number');
            assertEquals(output.maxSingleSize, 15728640);
          }
        );
      }
    );

    describe(
      'overrideConfig() returns an object with properties that match properties in mockDefaultFileData',
      () => {
        it(
          '`output` object has property `allowedTypes` with the same type as the same property in `mockDefaultFileData`',
          () => {
            const output = overrideConfig(mockDefaultFileData, mockOverride);

            assertEquals(output.hasOwnProperty('allowedTypes'), true);
            assertEquals(Array.isArray(output.allowedTypes), true);
            assertEquals(output.allowedTypes.length, 5);
            assertEquals(output.allowedTypes, mockOverride.allowedTypes);
          },
        );

        it(
          '`output` object has property `maxImgPx` with the same type as the same property in `mockDefaultFileData`',
          () => {
            const output = overrideConfig(mockDefaultFileData, mockOverride);

            assertEquals(output.hasOwnProperty('maxImgPx'), true);
            assertEquals(typeof output.maxImgPx, typeof mockDefaultFileData.maxImgPx);
            assertEquals(output.maxImgPx, mockOverride.maxImgPx);
          },
        );

        it(
          '`output` object has property `maxSingleSize` with the same type as the same property in `mockDefaultFileData`',
          () => {
            const output = overrideConfig(mockDefaultFileData, mockOverride);

            assertEquals(output.hasOwnProperty('maxSingleSize'), true);
            assertEquals(typeof output.maxSingleSize, 'number');
            assertEquals(output.maxSingleSize, 15728640);
          },
        );
      },
    );

    describe(
      'overrideConfig() returns an object with properties that match properties in mockDefaultFileList',
      () => {
        it(
          '`output` object has property `allowedTypes` with the same type as the same property in `mockDefaultFileList`',
          () => {
            const output = overrideConfig(mockDefaultFileList, mockOverride);

            assertEquals(output.hasOwnProperty('allowedTypes'), true);
            assertEquals(Array.isArray(output.allowedTypes), true);
            assertEquals(output.allowedTypes.length, 5);
            assertEquals(output.allowedTypes, mockOverride.allowedTypes);
          }
        );

        it(
          '`output` object has property `greyScale` with the same type as the same property in `mockDefaultFileList`',
          () => {
            const output = overrideConfig(mockDefaultFileList, mockOverride);

            assertEquals(output.hasOwnProperty('greyScale'), true);
            assertEquals(typeof output.greyScale, typeof mockDefaultFileList.greyScale);
            assertEquals(output.greyScale, mockOverride.greyScale);
          }
        );

        it(
          '`output` object has property `jpegCompression` with the same type as the same property in `mockDefaultFileList`',
          () => {
            const output = overrideConfig(mockDefaultFileList, mockOverride);

            assertEquals(output.hasOwnProperty('jpegCompression'), true);
            assertEquals(typeof output.jpegCompression, typeof mockDefaultFileList.jpegCompression);
            assertEquals(output.jpegCompression, mockOverride.jpegCompression);
          }
        );

        it(
          '`output` object has property `maxImgPx` with the same type as the same property in `mockDefaultFileList`',
          () => {
            const output = overrideConfig(mockDefaultFileList, mockOverride);

            assertEquals(output.hasOwnProperty('maxImgPx'), true);
            assertEquals(typeof output.maxImgPx, typeof mockDefaultFileList.maxImgPx);
            assertEquals(output.maxImgPx, mockOverride.maxImgPx);
          }
        );

        it(
          '`output` object has property `maxFileCount` with the same type as the same property in `mockDefaultFileList`',
          () => {
            const output = overrideConfig(mockDefaultFileList, mockOverride);

            assertEquals(output.hasOwnProperty('maxFileCount'), true);
            assertEquals(typeof output.maxFileCount, 'number');
            assertEquals(output.maxFileCount, 15);
          }
        );

        it(
          '`output` object has property `maxSingleSize` with the same type as the same property in `mockDefaultFileList`',
          () => {
            const output = overrideConfig(mockDefaultFileList, mockOverride);

            assertEquals(output.hasOwnProperty('maxSingleSize'), true);
            assertEquals(typeof output.maxSingleSize, 'number');
            assertEquals(output.maxSingleSize, 15728640);
          }
        );

        it(
          '`output` object has property `maxTotalSize` with the same type as the same property in `mockDefaultFileList`',
          () => {
            const output = overrideConfig(mockDefaultFileList, mockOverride);

            assertEquals(output.hasOwnProperty('maxTotalSize'), true);
            assertEquals(typeof output.maxTotalSize, 'number');
            assertEquals(output.maxTotalSize, 47185920);
          }
        );

        it(
          '`output` object has property `messages` with the same type as the same property in `mockDefaultFileList`',
          () => {
            const output = overrideConfig(mockDefaultFileList, mockOverride);

            assertEquals(output.hasOwnProperty('messages'), true);
            assertEquals(Object.prototype.toString.call(output.messages), '[object Object]');
            assertEquals(Object.keys(output.messages).length, 3);
          }
        );
      },
    );

    describe(
      'overrideConfig() returns an object with `messages` property',
      () => {

        it(
          '`output` object has property `messages` with the same type as the same property in `mockDefaultFileList`',
          () => {
            const output = overrideConfig(mockDefaultFileList, mockOverride);

            assertEquals(typeof output.messages, 'object');
            assertEquals(Object.prototype.toString.call(output.messages), '[object Object]');
            assertEquals(Object.keys(output.messages).length, Object.keys(mockDefaultFileList.messages).length);
          },
        );

      }
    );
  }
)

// Deno.test(
//   'overrideConfig() returns an object with the same properties as the original',
//   () => {
//     const output = overrideConfig(mockDefaultFileList, mockOverride);

//     assertEquals(typeof output.greyScale, typeof mockDefaultFileList.greyScale);
//     assertEquals(typeof output.jpegCompression, typeof mockDefaultFileList.jpegCompression);
//     assertEquals(typeof output.maxFileCount, typeof mockDefaultFileList.maxFileCount);
//     assertEquals(typeof output.maxImgPx, typeof mockDefaultFileList.maxImgPx);
//     assertEquals(typeof output.maxSingleSize, typeof mockDefaultFileList.maxSingleSize);
//     assertEquals(typeof output.maxTotalSize, typeof mockDefaultFileList.maxTotalSize);
//     assertEquals(typeof output.messages, typeof mockDefaultFileList.messages);
//   },
// );

// Deno.test(
//   'overrideConfig() `allowedTypes` is correct',
//   () => {
//     const output = overrideConfig(mockDefaultFileList, mockOverride);

//     assertEquals(output.hasOwnProperty('allowedTypes'), true);
//     assertEquals(Array.isArray(output.allowedTypes), true);
//     assertEquals(output.allowedTypes.length, mockOverride.allowedTypes.length);
//     assertEquals(output.allowedTypes[0], mockOverride.allowedTypes[0]);
//   },
// );

// Deno.test(
//   'overrideConfig() `greyScale` is correct',
//   () => {
//     const output = overrideConfig(mockDefaultFileList, mockOverride);

//     assertEquals(output.hasOwnProperty('greyScale'), true);
//     assertEquals(Array.isArray(output.greyScale), true);
//     assertEquals(output.greyScale, mockOverride.greyScale);
//     assertEquals(output.allowedTypes[0], mockOverride.allowedTypes[0]);
//   },
// );
