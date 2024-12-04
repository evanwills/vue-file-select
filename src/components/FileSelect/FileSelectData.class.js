import imageBlobReduce from 'image-blob-reduce';
import { getAllowedTypes, getUniqueFileName, humanFileSizeToBytes, isValidFileType } from './file-select-utils';
import { isObj } from '../../utils/data-utils';

/**
 * @typedef FileDataItem
 * @type {object}
 *
 * @property {string}  name       Unique name for file
 * @property {string}  ogName     Original name of selected file
 * @property {string}  ext        File extention
 * @property {string}  mime       File mime type
 * @property {string}  size       File size in bytes
 * @property {number}  position   Postion of the file within the list
 *                                of files
 * @property {boolean} invalid    Whether or not the file is a valid
 *                                type
 * @property {boolean} oversize   Whether or not the file exceeds the
 *                                maximum file size allowed
 * @property {boolean} processing Whether or not the file is
 *                                currently being processed
 * @property {File}    file       File object that can be uploaded to
 *                                the server
 */

const dummyDispatch = (_event, _data) => {};

export class FileSelectData {
  static #imgResize = null;
  static #maxFileCount = 15;
  static #maxImgPx = 1500;
  static #maxSingleSize = 15728640;
  static #maxTotalSize = 47185920;
  static #omitInvalid = true;
  static #noResize = false;
  static #defaultAllowed = [];

  #dispatch;
  #fileList;
  #totalSize;
  #processing;
  #allowedTypes;

  /**
   *
   * @param {string|null}   allowedTypes
   * @param {Function|null} dispatcher
   */
  constructor (allowedTypes = null, dispatcher = null) {
    if (FileSelectData.#imgResize === null) {
      FileSelectData.#imgResize = new imageBlobReduce();
    }

    this.#fileList = [];
    this.#dispatch = (typeof dispatcher === 'function')
      ? dispatcher
      : dummyDispatch;

    this.#totalSize = 0;
    this.#processing = 0;

    if (typeof allowedTypes !== 'string') {
      this.#allowedTypes = FileSelectData.#defaultAllowed;
    } else {
      this.#allowedTypes = getAllowedTypes(allowedTypes);
    }
  }

  // ----------------------------------------------------------------
  // START: Static getter & setter methods

  /**
   * Set the maximum number of files the user can upload
   *
   * @param {number} count
   *
   * @returns {void}
   */
  static setMaxFileCount (count) {
    if (typeof count !== 'number' || count < 1) {
      throw new Error(
        'FileSelectData.setMaxFileCount() expects only argument '
        + '`count` to be a number greater than 1',
      );
    }

    this.#maxFileCount = Math.round(count);
  }

  static getMaxFileCount () {
    return this.#maxFileCount;
  }

  /**
   * Set the maximim pixel count in either direction an image can
   * be before it is resized
   *
   * @param {number} count
   *
   * @returns {void}
   */
  static setMaxImgPx (px) {
    if (typeof px !== 'number' || px < 50 || px > 50000) {
      throw new Error(
        'FileSelectData.setMaxImgPx() expects only argument `px` '
        + 'to be a number that is greater than or equal to 50 and '
        + 'less than or equal to 50,000',
      );
    }

    this.#maxImgPx = Math.round(px);
  }

  static getMaxImgPx () {
    return this.#maxImgPx;
  }

  static omitInvalid () {
    this.#omitInvalid = true;
  }

  static keepInvalid () {
    this.#omitInvalid = false;
  }

  static setMaxSingleSize (max) {
    const t = typeof max;
    if (t !== 'string')  {
      throw new Error(
        'FileSelectData.setMaxSingleSize() expects only argument '
        + `\`max\` to be a string. ${t} given`,
      );
    }

    try {
      this.#maxSingleSize = humanFileSizeToBytes(max);
    } catch (e) {
      throw new Error(
        e.message.replace(
          /^.*?. /,
          'FileSelectData.setMaxSingleSize() ',
        ),
      );
    }
  }

  static getMaxSingleSize () {
    return this.#maxSingleSize;
  }

  static setMaxTotalSize (max) {
    const t = typeof max;

    if (t !== 'string')  {
      throw new Error(
        'FileSelectData.setMaxTotalSize() expects only argument '
        + `\`max\` to be a string. ${t} given`,
      );
    }

    try {
      this.#maxTotalSize = humanFileSizeToBytes(max);
    } catch (e) {
      throw new Error(
        e.message.replace(
          /^.*?. /,
          'FileSelectData.setMaxTotalSize() ',
        ),
      );
    }
  }

  static getMaxTotalSize () {
    return this.#maxTotalSize;
  }

  static getOmitInvalid () {
    return this.#omitInvalid;
  }

  static getNoResize () {
    return this.#noResize;
  }

  static getEventTypes () {
    return {

    }
  }

  //  END:  Static methods
  // ----------------------------------------------------------------
  // START: private methods

  /**
   * Add a file to the list of files to upload (if it's OK to do so)
   *
   * @param {Object} file File data object
   *
   * @returns {boolean|null} TRUE if the file was added to the list.
   *                         FALSE if it wasn't added and
   *                         NULL if it replaced an existing file.
   */
  #addFileToList (file) {
    if (FileSelectData.#omitInvalid === true &&
      (file.invalid === true || file.oversize === true)
    ) {
      return false;
    }

    for (let a = 0; a < this.#fileList.length; a += 1) {
      if (this.#fileList[a].name === file.name) {
        // This is a file we've already seen.
        // We'll just update it's postion and replace the previous
        // version.
        file.position = a; // eslint-disable-line no-param-reassign
        this.#fileList[a] = file;
        return null;
      }
    }

    // Only add new files if we are still under the maximum total
    // upload size AND the maximum upload count OR we don't care
    // about invalid files
    if (FileSelectData.#omitInvalid === false
      || (this.#totalSize <= FileSelectData.#maxTotalSize
      && this.#fileList.length < FileSelectData.#maxFileCount)
    ) {
      file.position = this.#fileList.length; // eslint-disable-line no-param-reassign
      this.#fileList.push(file);
      return true;
    }
  }

  #calculateTotal () {
    let sum = 0;
    for (const file in this.fileList) {
      sum += file.size
    }

    this.#totalSize = sum;

    if (this.#totalSize > FileSelectData.#maxTotalSize) {
      this.#dispatch('toobig', this.#totalSize);
    }
  }

  #processInvalidFile (file) {
    if (isValidFileType(file, this.#allowedTypes) === true) {
      return false;
    }

    tmp.invalid = true;
    this.#addFileToList(file);
    this.#dispatch('invalid', file.name);

    return true;
  }

  #finaliseProcessing (file, inc = 0) {
    this.#processing -= inc;
    this.#dispatch('complete', file.name);

    if (context.#fileList.length > FileSelectData.#maxFileCount) {
      this.#dispatch('toomany', this.#fileList.length);
    }

    this.#calculateTotal();
    this.#dispatch('allcomplete', (this.#processing === 0));
  }

  #processOverSizedFile (file, resizeFailed = false) {
    if (file.size <= FileSelectData.#maxSingleSize
      || (file.isImage === true && resizeFailed === false)
    ) {
      return false;
    }

    tmp.oversize = true
    this.#addFileToList(file);

    this.#dispatch('oversize', file.name);

    return true;
  }

  #processImageThen (context, file) {
    return (blob) => {
      file.file = new File(
        [blob],
        file.name,
        {
          type: blob.type,
          lastModified: new Date(),
        }
      )
      file.processing = false;
      file.size = file.file.size;

      context.#addFileToList(file);
      context.#finaliseProcessing(file, 1);
    };
  }

  #processImageCatch (context, file) {
    return (error) => {
      if (error.toString().includes('Pica: cannot use getImageData on canvas')) {
        FileSelectData.#noResize = true;
      }

      context.#processOverSizedFile(file, true);
      context.#finaliseProcessing(file, 1);
    }
  }

  //  END:  private methods
  // ----------------------------------------------------------------
  // START: Public getter methods

  getDispatch () { return this.#dispatch; }

  maxFiles () { return FileSelectData.#maxFileCount; }

  maxTotalSize () { return FileSelectData.#maxTotalSize; }

  maxPx () { return FileSelectData.#maxImgPx; }

  omitInvalid() { return FileSelectData.#omitInvalid; }

  noResize () { return FileSelectData.#noResize; }

  totalSize () { return this.#totalSize; }
  fileCount () { return this.#fileList.length; }

  isProcessing () { return this.#processing > 0; }

  //  END:  Public getter methods
  // ----------------------------------------------------------------
  // START: General public methods

  /**
   *
   * @param {FileList} files
   *
   * @returns {Promise<{}}
   */
  processFiles (files, dummyURL) {
    if ((files instanceof FileList) === false || files.length === 0) {
      throw new Error(
        'FileSelectData.processFiles() expects only argument to be '
        + 'an instance of FileList containing at least one file',
      );
    }

    const newFiles = [];

    this.#dispatch('processcount', files.length);

    for (const file of files) {
      newFiles.push(this.processSingleFile(file, dummyURL));
    }

    return {
      fileList: this.fileList,
      newFiles,
    };
  }

  processSingleFile (file) {
    const tmp = {
      ext: file.name.replace(/^.*?\.([a-z\d]+)$/i, ''),
      file,
      oversize: false,
      invalid: false,
      mime: file.type,
      name: getUniqueFileName(file.name),
      ogName: file.name,
      position: -1,
      processing: false,
      size: file.size,
      isImage: file.type.startsWith('image/'),
    };

    this.#dispatch('processing', tmp.name);

    if (this.#processInvalidFile(tmp) === true
      || this.#processOverSizedFile(tmp) === true
    ) {
      this.#finaliseProcessing(tmp);
      return false;
    }

    if (tmp.isImage === false || FileSelectData.#noResize === true) {
      this.#finaliseProcessing(tmp);
      return true;
    }

    this.#processing += 1;

    FileSelectData.#imgResize(file, { max: FileSelectData.#maxImgPx })
      .then(this.#processImageThen(this, tmp))
      .catch(this.#processImageCatch(this, tmp));

    return true;
  }

  /**
   * Change the relative position of a file within the list of files
   * that the user has selected
   *
   * @param {string} name  Name of file to be moved.
   * @param {number} place Positive or Negative integer
   *
   * @returns {boolean} TRUE if file was successfully moved.
   *                    FALSE otherwise.
   */
  moveFile (name, place) {
    const max = this.fileList.length - 1

    for (let a = 0; a < this.fileList.length; a += 1) {
      if (this.fileList[a].name === name) {
        const from = a;
        const to = a + place;

        if (to === a) {
          return false;
        } else if (to < a && to < 0) {
          if (a === 0) {
            return false;
          }
          to = 0;
        } else if (to > a && to > max) {
          if (a >= max) {
            return false;
          }
          to = max;
        }

        const item = this.fileList[from];
        this.fileList.splice(from, 1);
        this.fileList.splice(to, 0, item);

        for (let b = from; b < to; b += 1) {
          this.fileList[b].position = b;
        }
        return true;
      }
    }

    return false;
  }

  /**
   *
   * @param {string} name
   *
   * @returns {boolean} TRUE if file was deleted. FALSE otherwise
   */
  deleteFile (name) {
    const l = this.fileList.length;

    this.fileList = this.fileList.filter((file) => (file.name !== name));

    return (this.fileList.length < l);
  }

  async getFileList () {
    const output = new DataTransfer();

    for (const file of this.#fileList) {
      output.items.add(file);
    }

    return output;
  }

  /**
   * Get a FormData object
   *
   * @param {Object|null} data
   * @returns {FormData}
   */
  async getFormData (data = null) {
    const promises = [];
    let form = new FormData();

    for (const file of this.#fileList) {
      promises.push(Promise.resolve(form.append('File', file)));
    }

    if (isObj(data)) {
      for (const key of data) {
        form.append(key, data[key]);
      }
    }

    await Promise.all(promises);

    return form;
  }

  //  END:  General public methods
  // ----------------------------------------------------------------
}
