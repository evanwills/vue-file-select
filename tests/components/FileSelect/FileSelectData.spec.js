import { test, expect } from 'vitest';
// import * as matchers from 'jest-extended';
import FileSelectFileData from '../../../src/components/FileSelect/logic/FileSelectFileData.class';
// expect.extend(matchers);

console.log('URL:', URL);
console.log('URL.createObjectURL:', URL.createObjectURL);

test('test instatiating new FileSelectFileData object',
  () => {
    const dummyFile = new File([], 'testFile.txt', { type: 'text/text' });
    const tmp = new FileSelectFileData(dummyFile);

    expect(tmp).toBeInstanceOf(FileSelectFileData);
  },
);

test('test FileSelectFileData has right file extension',
  () => {
    const dummyFile = new File([], 'testFile.txt', { type: 'text/text' });
    const tmp = new FileSelectFileData(dummyFile);

    expect(typeof tmp.ext).toBe('string');
    expect(tmp.ext).toBe('txt');
  },
);

test('test FileSelectFileData has right file extension',
  () => {
    const dummyFile = new File([], 'testFile.txt', { type: 'text/text' });
    const tmp = new FileSelectFileData(dummyFile);

    expect(typeof tmp.ext).toBe('string');
    expect(tmp.ext).toBe('txt');
  },
);

test('test FileSelectFileData has list of allowed types',
  () => {
    const dummyFile = new File([], 'testFile.txt', { type: 'text/text' });
    const tmp = new FileSelectFileData(dummyFile, { allowedTypes: 'TXT, SVG, PDF' });

    expect(Array.isArray(tmp.allowedTypes)).toBe(true);
    expect(tmp.allowedTypes.length).toBe(3);
  },
);

test('test FileSelectFileData is not OK if wrong file type is supplied',
  () => {
    const dummyFile = new File([], 'testFile.txt', { type: 'text/text' });
    const tmp = new FileSelectFileData(dummyFile, { allowedTypes: 'html, SVG, PDF' });

    expect(tmp.ok).toBe(false);
  },
);

test('test FileSelectFileData had ID',
  () => {
    const dummyFile = new File([], 'testFile.txt', { type: 'text/text' });
    const tmp = new FileSelectFileData(dummyFile, { allowedTypes: 'html, SVG, PDF' });

    expect(typeof tmp.id).toBe('string');
    expect(tmp.id.length).toBe(8);
  },
);

test('test FileSelectFileData is not image when non-image file is supplied',
  () => {
    const dummyFile = new File([], 'testFile.txt', { type: 'text/text' });
    const tmp = new FileSelectFileData(dummyFile, { allowedTypes: 'html, SVG, PDF' });

    expect(tmp.isImage).toBe(false);
  },
);

// This is skipped because Vitest or Node doesn't implement
// the full URL API. In particular, it doesn't implement the
// static method: `createObjectURL()`
// See: https://developer.mozilla.org/en-US/docs/Web/API/URL
// and  https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
test.skip('test FileSelectFileData is image when image file is supplied',
  () => {
    const dummyFile = new File([], 'testFile.png', { type: 'image/png' });
    const tmp = new FileSelectFileData(dummyFile, { allowedTypes: 'PNG, SVG, PDF' });
    console.log('URL:', URL);

    expect(tmp.isImage).toBe(true);
  },
);
