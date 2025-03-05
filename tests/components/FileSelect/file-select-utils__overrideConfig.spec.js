import * as matchers from 'jest-extended';
import { overrideConfig } from '../../../src/components/FileSelect/logic/file-select-utils';
expect.extend(matchers);

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
  greyScale: true,
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
  logging: true,
  maxFileCount: 10,
  maxImgPx: 2000,
  maxSingleSize: '4MB',
  maxTotalSize: '40MB',
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
  'overrideConfig() simpleOverride',
  () => {
    const output = overrideConfig(mockDefaultFileList, mockOverride);
    test(
      'ouput is an object',
      () => {
        expect(output).toBeObject();
        expect(Object.keys(output).length).toBeNumber();
      }
    )
  },
);
