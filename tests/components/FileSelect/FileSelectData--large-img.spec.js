import fs from 'node:fs';
import { test, expect } from 'vitest';
import FileSelectFileData from '../../../src/components/FileSelect/logic/FileSelectData.class';
import ImageProcessor from '../../../src/components/FileSelect/logic/ImageProcessor.IBR.class';

const when = 1741807371600; // 2025-03-13 06:22:51.600 (Sydney)
// const fName = '20210427_180952.jpg'; // 2,301 KB -- 4032 x 3024
// const fName = '20210617_164014.jpg'; // 4,337 KB -- 4032 x 3024
const fName = 'PXL_20231223_214922605.jpg'; // 1,216 KB -- 4032 x 2268

const testJpgFile = new File(
  fs.readFileSync(`./tests/mock-assets/${fName}`),
  fName,
  {
    type: 'image/jpeg',
    lastModified: when - 7777,
  }
);

//  END:  mock data
// ==============================================



test('FileSelectFileData is file data properties are updated after file is replaced',
  () => {
    const tmp = new FileSelectFileData(
      testJpgFile,
      { allowedTypes: 'TXT, JPG, SVG, PDF' },
      // null,
      // new ImageProcessor(new Canvas()),
    );

    expect(tmp.name).toBe(fName);
    expect(tmp.ext).toBe('jpg');
    expect(tmp.mime).toBe('image/jpeg');
    expect(tmp.size).toBe(3216454);
    expect(tmp.lastModified).toBe(1741807363823);
    expect(tmp.invalid).toBe(false);
    expect(tmp.isImage).toBe(true);
    expect(tmp.replaceCount).toBe(0);
    expect(tmp.processing).toBe(false);
  },
);
