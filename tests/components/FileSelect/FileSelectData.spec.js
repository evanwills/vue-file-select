import fs from 'node:fs';
import { test, expect } from 'vitest';
import FileSelectFileData from '../../../src/components/FileSelect/logic/FileSelectFileData.class';

const when = 1741807371600; // 2025-03-13 06:22:51.600 (Sydney)

const testTextFile = new File(
  ['This is a test file'],
  'testTextFile.txt',
  {
    type: 'text/plain',
    lastModified: when
  }
);
const testSvgFile = new File(
  ['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="37.07" height="36" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 198"><path fill="#41B883" d="M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0h47.36Z"></path><path fill="#41B883" d="m0 0l128 220.8L256 0h-51.2L128 132.48L50.56 0H0Z"></path><path fill="#35495E" d="M50.56 0L128 133.12L204.8 0h-47.36L128 51.2L97.92 0H50.56Z"></path></svg>'],
  'testTextFile.svg',
  {
    type: 'image/svg+xml',
    lastModified: when
  }
);

const testPngFile = new File(
  fs.readFileSync('./src/assets/vue.png'),
  'vue.png',
  {
    type: 'image/png',
    lastModified: when
  }
);

//  END:  mock data
// ==============================================

test('test instatiating new FileSelectFileData object',
  () => {
    const tmp = new FileSelectFileData(testTextFile);

    expect(tmp).toBeInstanceOf(FileSelectFileData);
  },
);

test('test FileSelectFileData has right file extension',
  () => {
    const tmp = new FileSelectFileData(testTextFile);

    expect(typeof tmp.ext).toBe('string');
    expect(tmp.ext).toBe('txt');
  },
);

test('test FileSelectFileData has right file extension',
  () => {
    const tmp = new FileSelectFileData(testTextFile);

    expect(typeof tmp.ext).toBe('string');
    expect(tmp.ext).toBe('txt');
  },
);

test('test FileSelectFileData has list of allowed types',
  () => {
    const tmp = new FileSelectFileData(testTextFile, { allowedTypes: 'TXT, SVG, PDF' });

    expect(Array.isArray(tmp.allowedTypes)).toBe(true);
    expect(tmp.allowedTypes.length).toBe(3);
  },
);

test('test FileSelectFileData is not OK if wrong file type is supplied',
  () => {
    const tmp = new FileSelectFileData(testTextFile, { allowedTypes: 'html, SVG, PDF' });

    expect(tmp.ok).toBe(false);
  },
);

test('test FileSelectFileData is invalid if wrong file type is supplied',
  () => {
    const tmp = new FileSelectFileData(testTextFile, { allowedTypes: 'html, SVG, PDF' });

    expect(tmp.invalid).toBe(true);
  },
);

test('test FileSelectFileData had ID',
  () => {
    const tmp = new FileSelectFileData(testTextFile, { allowedTypes: 'html, SVG, PDF' });

    expect(typeof tmp.id).toBe('string');
    expect(tmp.id.length).toBe(8);
  },
);

test('test FileSelectFileData is not image when non-image file is supplied',
  () => {
    const tmp = new FileSelectFileData(testTextFile, { allowedTypes: 'html, SVG, PDF' });

    expect(tmp.isImage).toBe(false);
  },
);

test('test FileSelectFileData is image when image file is supplied',
  () => {
    const tmp = new FileSelectFileData(testPngFile, { allowedTypes: 'PNG, SVG, PDF' });

    expect(tmp.isImage).toBe(true);
  },
);
