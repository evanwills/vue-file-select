import * as matchers from 'jest-extended';
import { overrideMessages } from '../../../src/components/FileSelect/logic/file-select-utils';
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
];

const mockOverride = {
  noResize: 'This browser does not support image resizing. '
    + 'Please use a supported browser like Chrome or Firefox.',
  tooBigFile: 'File size exceeds allowable limit. '
    + 'Individual files must be less than [[FILE_SIZE]] and'
    + ' [[MAX_TOTAL]] total for multiple files.',
  invalidType: 'We detected an invalid file type. '
    + 'Valid file types are: [[TYPE_LIST]]',
};

const mockDefault = {
    noResize: 'This browser does not support image resizing. '
      + 'Please use a supported browser like Chrome or Firefox.',
    tooBigFile: 'File size ([[FILE_SIZE]]) exceeds allowable limit '
      + '([[MAX_SINGLE]]).',
    invalidType: 'We detected an invalid file type. '
      + 'Valid file types are: [[TYPE_LIST]]',
};

describe(
  'overrideMessages() simpleOverride',
  () => {
    const output = overrideMessages(mockDefault, mockOverride);
    test(
      'ouput is an object',
      () => {
        expect(output).toBeObject();
        expect(Object.keys(output).length).toBe(Object.keys(mockDefault).length);
      }
    )
  },
);
