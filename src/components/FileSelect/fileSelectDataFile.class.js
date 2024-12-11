
import { nanoid } from 'nanoid';
import { getUniqueFileName } from './file-select-utils';

export default class {
  id = null;
  ext;
  file;
  invalid = false;
  isImage;
  metadata = null;
  mime;
  name;
  ogName;
  ok = true;
  oversize;
  position = -1;
  previousName;
  processing = false;
  #maxSize = 15728640

  constructor (file, max = 15728640) {
    this.id = null;
    this.ext = file.name.replace(/^.*?\.([a-z\d]+)$/i, '');
    this.file = file;
    this.invalid = false;
    this.isImage = file.type.startsWith('image/');
    this.metadata = null;
    this.mime = file.type;
    this.name = getUniqueFileName(file.name);
    this.ogName = file.name;
    this.ok = true;
    this.position = -1;
    this.previousName = file.name;
    this.processing = false;
    this.size = file.size;

    this.#maxSize = max;
  }

  size () {
    return this.file.size;
  }

  lastModified () {
    return this.file.lastModifiedDate;
  }

  isOversized () {
    return (file.size > max);
  }

  setId () {
    if (this.id === null) {
      this.id = nanoid(8);
    }

    return this.id;
  }

  /**
   * @param {number} pos
   */
  set position (pos) {
    if (typeof pos === 'number' && number >= 0) {
      this.position = pos;
    }
  }

  /**
   * @param {boolean} ok
   */
  set ok (ok) {
    if (typeof ok === 'boolean') {
      this.ok = ok
    }
  }

  /**
   * @param {string} name
   */
  set name (newName) {
    if (typeof newName === 'string' && newName.trim() !== '') {
      this.previousName = this.name;
      this.name = newName;

    }
  }

  /**
   * @param {string} name
   */
  set mime (mime) {
    if (typeof mime === 'string') {
      this.mime = mime;
    }
  }
}
