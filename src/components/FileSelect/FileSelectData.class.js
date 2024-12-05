import imageBlobReduce from 'image-blob-reduce';
import {
  cloneFileDataItem,
  dummyDispatch,
  getAllowedTypes,
  getEventTypes,
  getUniqueFileName,
  humanFileSizeToBytes,
  isValidFileType,
  resetPos,
} from './file-select-utils';
import { isObj } from '../../utils/data-utils';

// ==================================================================
// START: Local type definitions

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
 * @property {boolean} ok         Whether or not there are issues
 *                                with this file
 * @property {boolean} oversize   Whether or not the file exceeds the
 *                                maximum file size allowed
 * @property {boolean} processing Whether or not the file is
 *                                currently being processed
 * @property {File}    file       File object that can be uploaded to
 *                                the server
 */

/**
 * `TRUE` if there are no more files yet to complete processing.
 * `FALSE` otherwise.
 *
 * The `allcompleted` event is dispatched every time processing a
 * single file is complete.
 *
 * @typedef AllCompleteEventData
 * @type {boolean}
 */

/**
 * The `complete` event is dispatched every time processing a
 * single file is complete.
 *
 * @typedef CompleteEventData
 * @type {object}
 *
 * @property {string} name Name of the file that has completed
 *                         processing
 * @property {number} pos  Position of the file within the list of
 *                         files the user has selected
 */

/**
 * The name of single file being processed.
 *
 * The `invalid` event is dispatched when processing a file has
 * completed AND that is not one of the types allowed
 *
 * @typedef InvalidEventData
 * @type {string}
 */

/**
 * The `oversize` event is dispatched when a processing a file has
 * completed AND the file is larger than the maximum allowed for a
 * single file.
 *
 * @typedef OversizeEventData
 * @type {object}
 *
 * @property {string} name Name of the file that has completed
 *                         processing
 * @property {number} size The file size (in bytes) for this file
 * @property {number} max  The mximum size (in bytes) allowed for a
 *                         single file
 */

/**
 * The number of files about to be processed.
 *
 * The `processcount` event is dispatched when
 * `FileSelectData.processFiles` is called
 *
 * @typedef ProcesscountEventData
 * @type {number}
 */

/**
 * The name of single file being processed.
 *
 * The `processing` event is dispatched when
 * `FileSelectData.processSingleFile` is called
 *
 * @typedef ProcessingEventData
 * @type {string}
 */

/**
 * The `toobig` event is dispatched when a processing a file has
 * completed AND the total size (in bytes) maximum total size allowed
 *
 * @typedef ToobigEventData
 * @type {object}
 *
 * @property {string} name Name of the file that has completed
 *                         processing
 * @property {number} size The total number of bytes for all the
 *                         files uploaded
 * @property {number} max  The maximum total number of bytes allowed
 */

/**
 * The `toomany` event is dispatched when a processing a file has
 * completed AND the maximum number of files allowed has already
 * been reached.
 *
 * @typedef ToomanyEventData
 * @type {object}
 *
 * @property {string} name  Name of the file that has completed
 *                          processing
 * @property {number} count The number of files the user has selected
 * @property {number} max   Maximum number of files allowed
 */

/**
 * @typedef Dispatcher
 * @type {Function}
 *
 * @param {string} evenName Name of the event being dispatched
 * @param {AllCompleteEventData|CompleteEventData|InvalidEventData|ProcesscountEventData|ProcessingEventData|ToobigEventData|ToomanyEventData} data Data associated with the event
 *
 * @returns {any|void}
 */

/**
 * @typedef ProcessFilesReturn
 * @type {object}
 *
 * @property {FileDataItem[]} fileList All the files held by
 *                                FileSelectData
 * @property {boolean[]} newFiles
 */

/**
 * @typedef FProcessFiles
 * @type {Function}
 *
 * @param {FileList} files List of files provided by
 *                         `<input type="file" />`
 *
 * @returns
 */

//  END:  Local type definitions
// ==================================================================

/**
 * Handle all the data related parts of preparing user selected files
 * for upload to a server.
 *
 * @class FileSelectData
 * @param {string|null}     allowedTypes Space separated list of
 *                                       file extensions or mime
 *                                       types
 * @param {Dispatcher|null} dispatcher   Function to be called to
 *                                       inform the client about
 *                                       things that happen while
 *                                       processing a file.
 *
 * @method processFiles Process file(s) provided by
 *                      `<input type="file" />` and add them to the
 *                      list of files a user wants to update.
 * @method clean        Remove bad files AND (optionally) there are
 *                      too many files, remove suplus files plus, if
 *                      the total upload size is too large remove
 *                      the last file, until the upload size is below
 *                      the maximum allowed.
 * @method deleteFile   Remove a file from the list of files selected
 *                      by the user
 * @method moveFile     Change the relative position of a file within
 *                      the list of files that the user has selected
 * @method getFileList  Get a list of files (as would be created by
 *                      `<input type="file" />`) that could be added
 *                      to a `FormData` object and returned to a
 *                       server
 * @method getFormData  Get a FormData object that can be returned to
 *                      the server
 *
 * @method badFileCount The number of bad files in the list
 * @method eventTypes   Get an object keyed on event name and
 *                      containing the data type provided with the
 *                      event and a description of when the event is
 *                      called and why.
 * @method filesInProcess Get a count of the number of files
 *                      currently being processed (Most of the time
 *                      this will be zero)
 * @method getAllFiles  Get a list of files (and metadata) held by
 *                      this instance of FileSelectData
 * @method getBadFiles  Get a list of only the bad files (and
 *                      metadata)
 * @method getFileCount Get the number of files in this instance
 * @method getGoodFiles Get a list of only the good files (and
 *                      metadata)
 * @method getStatus    Get some basic data about the current state
 *                      of FileSelectData
 * @method goodFileCount The number of files that are safe to upload
 * @method hasBadFiles  Whether or not there are issues with any
 *                      individual files the user has selected
 * @method hasFiles     Whether or not there are any files in this
 *                      instance
 * @method hasGoodFiles Whether or not there are any files that are
 *                      OK to be uploaded
 * @method isProcessing Whether or not images are still being
 *                      processed
 * @method maxFiles     Get the maximum number of files allowed
 * @method maxPx        Get the maximum pixel count (in either
 *                      direction) currently allowed for images
 * @method maxSingleSize Get the maximum byte size allowed for a
 *                      single file
 * @method maxTotalSize Get the maximum total byte size allowed for
 *                      all files
 * @method noResize     Get the no resize state
 * @method ok           Whether or not it would be OK to upload the
 *                      selected files as is
 * @method omitInvalid  Get the omit invalid state
 * @method tooBig       Whether or not the total size of selected
 *                      files is larger than the maximum allowed
 * @method tooMany      Whether or not there are too many files
 *                      already added to the list
 * @method totalSize    Get the total size in bytes for all the files
 *                      in the list
 */
export class FileSelectData {
  static #imgResize = null;
  static #maxFileCount = 15;
  static #maxImgPx = 1500;
  static #maxSingleSize = 15728640;
  static #maxTotalSize = 47185920;
  static #omitInvalid = true;
  static #noResize = false;
  static #defaultAllowed = [];

  /**
   * Function to dispatch events to the client.
   *
   * @property {Dispatcher} dispatch
   */
  #dispatch;

  /**
   * List of files (with metadata) the user has selected for upload
   *
   * @property {FileDataItem[]} fileList
   */
  #fileList;

  /**
   * The total size of all the files the user has selected for upload
   * @property {number} totalSize
   */
  #totalSize;

  /**
   * The number of files still being processed
   *
   * @property {number}
   */
  #processing;

  /**
   * List of allowed file types.
   *
   * @property {Object[]}
   */
  #allowedTypes;

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

  //  END:
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

  /**
   * Get the maximum pixel count (in either direction) currently
   * allowed for images
   *
   * @returns {number}
   */
  static getMaxImgPx () {
    return this.#maxImgPx;
  }

  /**
   * Prevent FileSelectData from adding oversized or invalid files to
   * the list. Also prevent FileSelectData from adding files after
   * the maximum total upload size is reached or the total number of
   * allowed files is exceded.
   *
   * > __Note:__ This is the default behaviour
   *
   * @returns {void}
   */
  static omitInvalid () {
    this.#omitInvalid = true;
  }

  /**
   * Allow FileSelectData to add oversized or invalid files to the
   * list. Allow FileSelectData to keep adding files even after
   * the maximum total upload size is reached or the total number of
   * allowed files is exceded.
   *
   * @returns {void}
   */
  static keepInvalid () {
    this.#omitInvalid = false;
  }

  /**
   * Set the maximum size allowed for a single file
   *
   * @param {string|number} max If string, number will be parsed as
   *                            a human readable file size.
   *                            If number and equal to -1 or greater
   *                            than 256, the value will be assumed
   *                            to be bytes and set.
   *
   * @returns {void}
   * @throws {Error} If `max` is a number that is not `-1` and less
   *                 than 256.
   *                 OR
   *                 If `max` not a string or the string could not be
   *                 parsed.
   */
  static setMaxSingleSize (max) {
    const t = typeof max;
    if (t === 'number') {
      if (max === -1) {
        this.#maxSingleSize = (1024 * 1024 * 1024 * 1024);
      } else if (max > 256) {
        this.#maxSingleSize = max;
      } else {
        throw new Error(
          'FileSelectData.setMaxSingleSize() expects only argument '
          + '`max` to be a number that is -1 (equivalent to infinite)'
          + ' or greater than 256.',
        );
      }
    } else if (t !== 'string')  {
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

  /**
   * Get the maximum byte size allowed for a single file
   *
   * @returns {number}
   */
  static getMaxSingleSize () { return this.#maxSingleSize;}

  /**
   * Get the maximum total byte size allowed for all files
   *
   * @returns {number}
   */
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

  /**
   * Get the maximum total byte size allowed for all files
   *
   * @returns {number}
   */
  static getMaxTotalSize () { return this.#maxTotalSize; }

  /**
   * Get the omit invalid state
   *
   * @returns {boolean}
   */
  static getOmitInvalid () { return this.#omitInvalid; }

  /**
   * Get the no resize state
   *
   * @returns {boolean}
   */
  static getNoResize () { return this.#noResize; }

  /**
   * Get an object keyed on event name and containing the data type
   * provided with the event and a description of when the event is
   * called and why.
   *
   * @returns {object}
   */
  static getEventTypes () { return getEventTypes(); }

  //  END:  Static methods
  // ----------------------------------------------------------------
  // START: private methods

  /**
   * Add a file to the list of files to upload (if it's OK to do so)
   *
   * > __Note:__ If type of a file is an image and it needs to be
   * >           resized, this method will be called twice. Once when
   * >           the file is identified as an image and then again
   * >           when resizing is complete.
   *
   * @param {FileDataItem} file File data object currently being
   *                            processed
   *
   * @returns {boolean|null} TRUE if the file was added to the list.
   *                         FALSE if it wasn't added and
   *                         NULL if it replaced an existing file.
   */
  #addFileToList (file) {
    if (FileSelectData.#omitInvalid === true && file.ok === false) {
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
      || (this.tooBig() === false && this.tooMany() === false)
    ) {
      file.position = this.#fileList.length; // eslint-disable-line no-param-reassign
      this.#fileList.push(file);
      return true;
    }
  }

  /**
   * Calculate the total size of all the files in the file list
   *
   * @param {FileDataItem} file File data object currently being
   *                            processed
   *
   * @returns {void}
   */
  #calculateTotal (file) {
    let sum = 0;
    for (const _file in this.fileList) {
      sum += _file.size
    }

    this.#totalSize = sum;

    if (this.tooBig() === true) {
      this.#dispatch(
        'toobig',
        {
          name: file.name,
          size: this.#totalSize,
          max: FileSelectData.#maxTotalSize,
        },
      );
    }
  }

  /**
   * Check whether this type of file is allowed.
   *
   * @param {FileDataItem} file File data object currently being
   *                            processed
   *
   * @returns {boolean} TRUE if the file is not allowed.
   *                    FALSE otherwise
   */
  #processInvalidFile (file) {
    if (isValidFileType(file, this.#allowedTypes) === true) {
      return false;
    }

    tmp.invalid = true;
    tmp.ok = false;
    this.#addFileToList(file);
    this.#dispatch('invalid', file.name);

    return true;
  }

  #checkTooMany (name) {
    if (this.tooMany()) {
      this.#dispatch(
        'toomany',
        {
          name,
          count: this.#fileList.length,
          max: FileSelectData.#maxFileCount,
        },
      );
    }
  }

  /**
   *
   * @param {FileDataItem} file File data object currently being
   *                            processed
   * @param {number}       inc  The amount to decrement the
   *                            processing count
   *
   * @returns {void}
   */
  #finaliseProcessing (file, inc = 0) {
    this.#processing -= inc;
    this.#dispatch('complete', { name: file.name, pos: file.position });

    this.#checkTooMany(file.name);
    this.#calculateTotal();
    this.#dispatch('allcomplete', (this.#processing === 0));
  }

  /**
   * Check whether an file is too big. If so, do some extra work to
   * inform the client about the issue.
   *
   * @param {FileDataItem} file        File data object currently
   *                                   being processed
   * @param {boolean}       resizeDone Whether or not this method is
   *                                   being called after an image
   *                                   resize action
   * @returns {boolean} `TRUE` If the file was too large and could
   *                    not be further processed. `FALSE` otherwise.
   */
  #processOverSizedFile (file, resizeDone = false) {
    if (file.size <= FileSelectData.#maxSingleSize
      || (file.isImage === true && resizeDone === false)
    ) {
      return false;
    }

    tmp.oversize = true
    tmp.ok = false;
    this.#addFileToList(file);

    this.#dispatch(
      'oversize',
      {
        name: file.name,
        size: file.size,
        max: FileSelectData.#maxSingleSize,
      },
    );

    return true;
  }

  /**
   * Get a callback function to pass to `ImageBlobReduce.toBlob().then()`
   * to handle successful resizing of an image
   *
   * @param {FileSelectData} context
   * @param {FileDataItem}   file    File data object currently being
   *                                 processed
   * @returns {Function<{Blob}}}
   */
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

  /**
   * Get a callback function to pass to `ImageBlobReduce.toBlob().catch()`
   * to handle failed resizing of an image
   *
   * @param {FileSelectData} context
   * @param {FileDataItem}   file    File data object currently being
   *                                 processed
   * @returns {Function<{Blob}}}
   */
  #processImageCatch (context, file) {
    return (error) => {
      if (error.toString().includes('Pica: cannot use getImageData on canvas')) {
        FileSelectData.#noResize = true;
      }

      context.#processOverSizedFile(file, true);
      context.#finaliseProcessing(file, 1);
    }
  }

  /**
   * Process a single file
   *
   * @param {File} file File to be processed
   *
   * @returns {boolean} `TRUE` if the file could be added to the list.
   *                    `FALSE` otherwise
   */
  #processSingleFile (file) {
    const tmp = {
      ext: file.name.replace(/^.*?\.([a-z\d]+)$/i, ''),
      file,
      oversize: false,
      invalid: false,
      mime: file.type,
      name: getUniqueFileName(file.name),
      ok: true,
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

    FileSelectData.#imgResize.toBlob(file, { max: FileSelectData.#maxImgPx })
      .then(this.#processImageThen(this, tmp))
      .catch(this.#processImageCatch(this, tmp));

    return true;
  }

  //  END:  private methods
  // ----------------------------------------------------------------
  // START: Public getter methods

  /**
   * The number of bad files in the list
   *
   * @returns {number}
   */
  badFileCount () { return this.getFileCount(false); }

  /**
   * Get an object keyed on event name and containing the data type
   * provided with the event and a description of when the event is
   * called and why.
   *
   * @returns {object}
   */
  eventTypes () { return getEventTypes(); }

  /**
   * Get a list of files (and metadata) held by this instance of
   * FileSelectData
   *
   * @param {boolean|null} onlyGood If `NULL`, all files are returned
   *                                If `TRUE`, all bad files are
   *                                excluded.
   *                                If `FALSE` only bad files are
   *                                included
   *
   * @returns {FileDataItem[]}
   */
  getAllFiles (onlyGood = null) {
    if (onlyGood === null) {
      return this.#fileList.map(cloneFileDataItem);
    }

    return this.#fileList.filter((file) => (file.ok === onlyGood))
      .map(cloneFileDataItem);
  }

  /**
   * Get a list of only the bad files (and metadata)
   *
   * @returns {FileDataItem[]}
   */
  getBadFiles () { return this.getAllFiles(false); }

  /**
   * Get the dispatcher function being used in this instance
   *
   * @returns {Dispatcher}
   */
  getDispatch () { return this.#dispatch; }

  /**
   * Get the number of files in this instance
   *
   * @param {boolean|null} onlyGood If `NULL`, all files are counted
   *                                If `TRUE`, all bad files are
   *                                excluded from count.
   *                                If `FALSE` only bad files are
   *                                included in count.
   *
   * @returns {FileDataItem[]}
   */
  getFileCount (onlyGood = null) {
    if (onlyGood === null) {
      return this.#fileList.length;
    }

    let output = 0;
    for (const file of this.#fileList) {
      if (file.ok === onlyGood) {
        output += 1;
      }
    }

    return output;
  }

  /**
   * Get a list of only the good files (and metadata)
   *
   * @returns {FileDataItem[]}
   */
  getGoodFiles () { return this.getAllFiles(true); }

  /**
   * Get some basic data about the current state of FileSelectData
   *
   * @returns {Object}
   */
  getStatus () {
    const tooMany = this.tooMany();
    const tooBig = this.tooBig();
    const badFiles = this.badFileCount();
    const ok = (tooBig === false && tooMany === false && badFiles > 0);

    return {
      ok,
      tooMany,
      tooBig,
      badFiles,
      count: this.#fileList.length,
      size: this.#totalSize,
      processing: this.#processing,
    };
  }

  /**
   * The number of files that are safe to upload
   *
   * @returns {number}
   */
  goodFileCount () { return this.getFileCount(true); }

  /**
   * Whether or not there are any files in this instance
   *
   * @param {boolean|null} onlyGood If `NULL`, all files are tested
   *                                If `TRUE`, all bad files are
   *                                excluded from tested.
   *                                If `FALSE` only bad files are
   *                                included in test.
   *
   * @returns {boolean}
   */
  hasFiles (onlyGood = null) {
    if (onlyGood === null) {
      return (this.#fileList.length > 0);
    }

    for (const file of this.#fileList) {
      if (file.ok === onlyGood) {
        return true;
      }
    }

    return false;
  }

  /**
   * Whether or not there are issues with any individual files the
   * user has selected
   *
   * @returns {boolean}
   */
  hasBadFiles () { return this.hasFiles(false); }

  /**
   * Whether or not there are any files that are OK to be uploaded
   *
   * @returns {boolean}
   */
  hasGoodFiles () { return this.hasFiles(true); }

  /**
   * Whether or not images are still being processed
   *
   * @returns {boolean}
   */
  isProcessing () { return this.#processing > 0; }

  /**
   * Get the maximum number of files allowed
   *
   * @returns {number}
   */
  maxFiles () { return FileSelectData.#maxFileCount; }

  /**
   * Get the maximum pixel count (in either direction) currently
   * allowed for images
   *
   * @returns {number}
   */
  maxPx () { return FileSelectData.#maxImgPx; }

  /**
   * Get the maximum byte size allowed for a single file
   *
   * @returns {number}
   */
  maxSingleSize () { return FileSelectData.#maxSingleSize; }

  /**
   * Get the maximum total byte size allowed for all files
   *
   * @returns {number}
   */
  maxTotalSize () { return FileSelectData.#maxTotalSize; }

  /**
   * Get the no resize state
   *
   * @returns {boolean}
   */
  noResize () { return FileSelectData.#noResize; }

  /**
   * Whether or not it would be OK to upload the selected files as is
   *
   * @returns {boolean}
   */
  ok () {
    return (this.tooBig() === false
      && this.tooMany() === false
      && this.hasBadFiles() === false
      && this.#fileList.length > 0);
  }

  /**
   * Get the omit invalid state
   *
   * @returns {boolean}
   */
  omitInvalid() { return FileSelectData.#omitInvalid; }

  /**
   * Whether or not the total size of selected files is larger than
   * the maximum allowed
   *
   * @returns {boolean}
   */
  tooBig () {
    return (this.#totalSize > FileSelectData.#maxTotalSize);
  }

  /**
   * Whether or not there are already too many files selected
   *
   * @returns {boolean}
   */
  tooMany () {
    return (this.#fileList.length > FileSelectData.#maxFileCount);
  }

  /**
   * Get the total size in bytes for all the files in the list
   *
   * @returns {number}
   */
  totalSize () { return this.#totalSize; }

  //  END:  Public getter methods
  // ----------------------------------------------------------------
  // START: General public methods

  /**
   * Remove bad files AND (optionally) there are too many files,
   * remove suplus files plus, if the total upload size is too large
   * remove the last file, until the upload size is below the
   * maximum allowed.
   *
   * @param {boolean} deleteExcess Whether or not to delete files
   *                               that cause `FileSelectDatatooBig()`
   *                               or `FileSelectData.tooMany()` to
   *                               be `TRUE`
   *
   * @returns {true}
   */
  clean (deleteExcess = false) {
    this.#fileList = this.#fileList.filter((file) => file.ok === true);

    // Update the total upload size
    this.#calculateTotal();

    if (deleteExcess !== true) {
      return true;
    }

    if (this.tooMany()) {
      const diff = this.#fileList.length - FileSelectData.#maxFileCount;
      this.#fileList = this.#fileList.splice(FileSelectData.#maxFileCount - 1, diff);
    }

    if (this.tooBig() === true) {
      for (let a = this.#fileList.length - 1; a >= 0; a -= 1) {
        this.#fileList.pop();

        this.#calculateTotal();
        if (this.tooBig() === false) {
          return true;
        }
      }
    }
  }

  /**
   * Remove a file from the list of files selected by the user
   *
   * @param {string} name
   *
   * @returns {boolean} TRUE if file was deleted. FALSE otherwise
   */
  deleteFile (name) {
    const l = this.fileList.length;

    this.fileList = this.fileList.filter((file) => (file.name !== name)).map(resetPos);

    this.#calculateTotal();
    this.#checkTooMany(name);

    return (this.fileList.length < l);
  }

  /**
   * Process file(s) provided by `<input type="file" />` and add them
   * to the list of files a user wants to update.
   *
   * NOTE: While this function returns immediately, various events are dispatched via the `dispatcher` provided to the constructor if images can be resized, a promise will be envoked
   *
   * @param {FileList} files
   *
   * @returns {Object}
   */
  processFiles (files) {
    if ((files instanceof FileList) === false || files.length === 0) {
      throw new Error(
        'FileSelectData.processFiles() expects only argument to be '
        + 'an instance of FileList containing at least one file',
      );
    }

    const c = this.#fileList.length;
    const newFiles = [];

    this.#dispatch('processcount', files.length);

    for (const file of files) {
      newFiles.push(this.#processSingleFile(file));
    }

    const diff = (this.#fileList.length - c);

    return {
      ...this.getStatus(),
      newFiles: files.length,
      added: diff,
      multi: diff > 1,
    };
  }

  /**
   * Change the relative position of a file within the list of files
   * that the user has selected
   *
   * @param {string} name   Name of file to be moved.
   * @param {number} relPos Positive relative to its current position
   *                        in the list of files.
   *
   * @returns {boolean} TRUE if file was successfully moved.
   *                    FALSE otherwise.
   */
  moveFile (name, relPos) {
    const max = this.fileList.length - 1

    for (let a = 0; a < this.fileList.length; a += 1) {
      if (this.fileList[a].name === name) {
        const from = a;
        const to = a + relPos;

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

        this.fileList = this.#fileList.map(resetPos);
        return true;
      }
    }

    return false;
  }

  /**
   * Get a list of files (as would be created by `<input type="file" />`)
   * that could be added to a `FormData` object and returned to a
   * server
   *
   * @param {boolean|null} onlyGood If `NULL`, all files are returned
   *                                If `TRUE`, all bad files are
   *                                excluded.
   *                                If `FALSE` only bad files are
   *                                included
   *
   * @returns {FileList}
   */
  getFileList (onlyGood = null) {
    const output = new DataTransfer();

    for (const file of this.#fileList) {
      if (onlyGood === null || (onlyGood === file.ok)) {
        output.items.add(file.file);
      }
    }

    return output;
  }

  /**
   * Get a `FormData` object containing the files the user has selected
   * plus any other form field values the server may want
   *
   * @param {Object|null} data Additional form data to return to the
   *                           server
   *                           > __Note:__ If `data` is not an object,
   *                           >           it will be ignored.
   *
   *                           > __Note also:__ It is expected that
   *                           >           values in the `data` object
   *                           >           will already be in a format
   *                           >           that can be appended to
   *                           >           the `FormData` object
   *                           >           without causing issues.
   * @param {boolean} includeBad Whether or not to include bad files
   *
   * @returns {FormData}
   */
  async getFormData (data = null, includeBad = false) {
    const promises = [];
    let form = new FormData();

    for (const file of this.#fileList) {
      if (includeBad === true || file.ok === true) {
        promises.push(Promise.resolve(form.append('File', file)));
      }
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
