const jpeg = {
  ext: 'jpeg',
  mime: 'image/jpeg',
  name: 'JPEG',
  type: 'image',
};

const tiff = {
  ext: 'tif',
  mime: 'image/tiff',
  name: 'tif',
  type: 'image',
};

const midi = {
  ext: 'midi',
  mime: 'audio/x-midi',
  name: 'MIDI',
  type: 'audio',
};

/**
 * List of possible acceptible file types user can upload
 *
 * List is used to validate contents of props.types property
 *
 * * __key:__ the file extension string
 * * __value:__ the file MIME type - used when validating an selected file
 *
 * @var {object} fileTypes
 */
export default {
  bmp: {
    ext: 'bmp',
    mime: 'image/bmp',
    name: 'Bitmap',
    type: 'image',
  },
  csv: {
    ext: 'csv',
    mime: 'text/csv',
    name: 'CSV',
    type: 'document',
  },
  doc: {
    ext: 'doc',
    mime: 'application/msword',
    name: 'Old Microsoft Word',
    type: 'document',
  },
  docx: {
    ext: 'docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    name: 'Microsoft Word',
    type: 'document',
  },
  epub: {
    ext: 'epub',
    mime: 'application/epub+zip',
    name: 'EPub',
    type: 'document',
  },
  gif: {
    ext: 'gif',
    mime: 'image/gif',
    name: 'Gif',
    type: 'image',
  },
  jpg: jpeg, jpeg,
  ico: {
    ext: 'ico',
    mime: 'image/vnd.microsoft.icon',
    name: 'Icon',
    type: 'image',
  },
  pdf: {
    ext: 'pdf',
    mime: 'application/pdf',
    name: 'PDF',
    type: 'document',
  },
  png: {
    ext: 'png',
    mime: 'image/png',
    name: 'PNG',
    type: 'image',
  },
  rtf: {
    ext: 'rtf',
    mime: 'application/rtf',
    name: 'Rich Text Format',
    type: 'document',
  },
  svg: {
    ext: 'svg',
    mime: 'image/svg+xml',
    name: 'SVG',
    type: 'image',
  },
  txt: {
    ext: 'txt',
    mime: 'text/plain',
    name: 'Text',
    type: 'document',
  },

  aac: {
    ext: 'aac',
    mime: 'audio/aac',
    name: 'AAC',
    type: 'audio',
  },
  avi: {
    ext: 'avi',
    mime: 'video/x-msvideo',
    name: 'AVI',
    type: 'video',
  },
  azw: {
    ext: 'azw',
    mime: 'application/vnd.amazon.ebook',
    name: 'Kindle',
    type: 'document',
  },
  mid: midi, midi,
  mp3: {
    ext: 'mp3',
    mime: 'audio/mpeg',
    name: 'MP3',
    type: 'audio',
  },
  mp4: {
    ext: 'mp4',
    mime: 'video/mp4',
    name: 'MP4',
    type: 'video',
  },
  mpeg: {
    ext: 'mpeg',
    mime: 'video/mpeg',
    name: 'MPEG',
    type: 'video',
  },
  oga: {
    ext: 'oga',
    mime: 'audio/ogg',
    name: 'Ogg audio',
    type: 'audio',
  },
  ogv: {
    ext: 'ogv',
    mime: 'video/ogg',
    name: 'Ogg video',
    type: 'video',
  },
  opus: {
    ext: 'opus',
    mime: 'audio/opus',
    name: 'Opus',
    type: 'audio',
  },
  ppt: {
    ext: 'ppt',
    mime: 'application/vnd.ms-powerpoint',
    name: 'Powerpoint (old)',
    type: 'document',
  },
  pptx: {
    ext: 'pptx',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    name: 'Powerpoint',
    type: 'document',
  },
  tif: tiff, tiff,
  wav: {
    ext: 'wav',
    mime: 'audio/wav',
    name: 'wav',
    type: 'audio',
  },
  weba: {
    ext: 'weba',
    mime: 'audio/webm',
    name: 'weba',
    type: 'audio',
  },
  webm: {
    ext: 'webm',
    mime: 'video/webm',
    name: 'webm',
    type: 'video',
  },
  webp: {
    ext: 'webp',
    mime: 'image/webp',
    name: 'WebP',
    type: 'image',
  },
  xls: {
    ext: 'xls',
    mime: 'application/vnd.ms-excel',
    name: 'Excel (old)',
    type: 'document',
  },
  xlsx: {
    ext: 'xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    name: 'Excel',
    type: 'document',
  },
};
