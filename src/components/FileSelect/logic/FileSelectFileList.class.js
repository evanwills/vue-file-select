import {
  cloneFileDataItem,
  enhanceMessage,
  fileIsGood,
  fileIsOK,
  getEventTypes,
  getValidMaxFileCount,
  getValidMaxTotalSize,
  overrideConfig,
  resetPos,
  rewriteError,
} from './file-select-utils';
import { isObj } from '../../../utils/data-utils';
import FileSelectFileData from './FileSelectFileData.class';
import ImageProcessor from './ImageProcessor.IBR.class';
// import ImageProcessor from ./ImageProcessor.photon.class
import { FileSelectCommunicator } from './FileSelectCommunicator.class';

// ==================================================================
// START: Local type definitions

/**
 * Holds basic info about a single file, plus the `File` itself and
 * possibly image metadata, if the file is an image
 *
 * @typedef FileDataItem
 * @type {object}
 *
 *
 * @property {string}  ext          File extention
 * @property {File}    fileData     File object that can be uploaded
 *                                  to the server
 * @property {boolean} invalid      Whether or not the file is a
 * @property {boolean} isImage      Whether or not the file is an
 *                                  image
 * @property {string}  lastModified ISO8601 Date time string for when
 *                                  the file was last modified
 * @property {Object|null} metadata Basic info for image files
 * @property {string}  mime         File mime type
 * @property {string}  name         Unique name for file
 * @property {string}  ogName       Original name of selected file
 * @property {boolean} ok           Whether or not there are issues
 *                                  with this file
 * @property {boolean} oversize     Whether or not the file exceeds
 *                                  the maximum file size allowed
 * @property {number}  position     Postion of the file within the
 *                                  list of files
 * @property {boolean} processing   Whether or not the file is
 *                                  currently being processed
 * @property {string}  size         File size in bytes
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
 * The `processCount` event is dispatched when
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
 * A function that is called every time an event is dispatched and
 * does an action if the event is of a type it cares about.
 *
 * @typedef Watcher
 * @type {Function}
 *
 * @param {string} evenName Name of the event being dispatched
 * @param {
 *          AllCompleteEventData|
 *          CompleteEventData|
 *          InvalidEventData|
 *          ProcesscountEventData|
 *          ProcessingEventData|
 *          ToobigEventData|
 *          ToomanyEventData
 * } data Data associated with the event
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
 *
 * @param {ImageProcessor|null} imgProcessor Object that can be used to
 *                                         manipulate images
 * @param {Watcher|null}      watcher      Function to be called to
 *                                         inform the client about
 *                                         things that happen while
 *                                         processing a file.
 * @param {Object|null}       config       Values to override the
 *                                         static (default) config
 *                                         values that control limits
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
 *
 * @method getMaxImgPx  [static] Get the maximum pixel count (in
 *                      either direction) currently allowed for
 *                      images
 * @method getMaxSingleSize Get the maximum byte size allowed for a
 *                      single file
 * @method getMaxTotalSize Get the maximum total byte size allowed
 *                      for all files
 * @method getOmitInvalid Get the omit invalid state
 * @method getNoResize  Get the no resize state
 * @method getEventTypes Get an object keyed on event name and
 *                      containing the data type provided with the
 *                      event and a description of when the event is
 *                      called and why.
 * @method keepInvalid  Allow `FileSelectData` to add oversized or
 *                      invalid files to the list. Allow
 *                      `FileSelectData` to keep adding files even
 *                      after the maximum total upload size is
 *                      reached or the total number of allowed files
 *                      is exceded.
 * @method omitInvalid  Prevent `FileSelectData` from adding
 *                      oversized or invalid files to the list. Also
 *                      prevent `FileSelectData` from adding files
 *                      after the maximum total upload size is
 *                      reached or the total number of allowed files
 *                      is exceded.
 * @method setAllowedTypes Set default allowed types. Default types
 *                      are used when allowd types is not included in
 *                      the config object passed to the constructor
 * @method setMaxFileCount Set the maximum number of files the user
 *                      can upload
 * @method setMaxImgPx  Set the maximim pixel count in either
 *                      direction an image can be before it is
 *                      resized
 * @method setMaxSingleSize Set the maximum size allowed for a single
 *                      file
 * @method setMaxTotalSize Set the maximum total byte size allowed
 *                      for all files
 */
export class FileSelectFileList {
  // ----------------------------------------------------------------
  // START: Define static properties

  static #maxFileCount = 15;

  static #maxTotalSize = 47185920;

  static #omitInvalid = true;

  //  END:  Define static properties
  // ----------------------------------------------------------------
  // START: Define instance properties

  _canResize = true;

  /**
   * An object containing instance versions of the five static config values:

   * * `maxFileCount`
   * * `maxImgPx`
   * * `maxSingleSize`
   * * `maxTotalSize`
   * * `omitInvalid`
   * * `noResize`
   *
   * @property {object}
   */
  _config;

  /**
   * Function to dispatch events to the client.
   *
   * @property {FileSelectCommunicator} _comms
   */
  _comms;

  /**
   * List of files (with metadata) the user has selected for upload
   *
   * @property {FileDataItem[]} fileList
   */
  _fileList = [];

  /**
   * @property
   */
  _imgProcessor;

  _imageCount = 0;

  /**
   * Log of errors thrown by ImageBlobResize
   *
   * @property {Error[]}
   */
  _log = [];

  /**
   * The number of files still being processed
   *
   * @property {number}
   */
  _processingCount = 0;

  /**
   * The total size of all the files the user has selected for upload
   * @property {number} totalSize
   */
  _totalSize;

  //  END:  Define instance properties
  // ----------------------------------------------------------------
  // START: Static getter & setter methods

  /**
   * Get the maximum pixel count (in either direction) currently
   * allowed for images
   *
   * @returns {number}
   */
  static getGreyscale() { return ImageProcessor.getGreyscale(); }

  static getJpegCompression() {
    return ImageProcessor.getJpegCompression();
  }

  static getMaxFileCount() { return this.#maxFileCount; }

  /**
   * Get the maximum pixel count (in either direction) currently
   * allowed for images
   *
   * @returns {number}
   */
  static getMaxImgPx() { return ImageProcessor.getMaxImgPx(); }

  /**
   * Get the maximum byte size allowed for a single file
   *
   * @returns {number}
   */
  static getMaxSingleSize() { return FileSelectFileData.maxSingleSize(); }

  /**
   * Get the maximum total byte size allowed for all files
   *
   * @returns {number}
   */
  static getMaxTotalSize() { return this.#maxTotalSize; }

  /**
   * Get the omit invalid state
   *
   * @returns {boolean}
   */
  static getOmitInvalid() { return this.#omitInvalid; }

  /**
   * Get the no resize state
   *
   * @returns {boolean}
   */
  static getNoResize() { return this.getNoResize(); }

  /**
   * Get an object keyed on event name and containing the data type
   * provided with the event and a description of when the event is
   * called and why.
   *
   * @returns {object}
   */
  static getEventTypes() { return getEventTypes(); }

  /**
   * Allow FileSelectData to add oversized or invalid files to the
   * list. Allow FileSelectData to keep adding files even after
   * the maximum total upload size is reached or the total number of
   * allowed files is exceded.
   *
   * @returns {void}
   */
  static keepInvalid() {
    this.#omitInvalid = false;
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
  static omitInvalid() {
    this.#omitInvalid = true;
  }

  /**
   * Set default allowed file types
   *
   * @param {string} allowedTypes
   */
  static setAllowedTypes(allowedTypes) {
    try {
      FileSelectFileData.setAllowedTypes(allowedTypes);
    } catch (e) {
      throw Error(e.message);
    }
  }

  /**
   * Set the maximum number of files the user can upload
   *
   * @param {number} count
   *
   * @returns {void}
   */
  static setMaxFileCount(count) {
    try {
      this.#maxFileCount = getValidMaxFileCount(count);
    } catch (e) {
      throw Error(rewriteError(e.message));
    }
  }

  /**
   * Set the maximim pixel count in either direction an image can
   * be before it is resized
   *
   * @param {number} count
   *
   * @returns {void}
   */
  static setMaxImgPx(px) {
    try {
      FileSelectFileData.setMaxImgPx(px);
    } catch (e) {
      throw Error(rewriteError(e.message));
    }
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
  static setMaxSingleSize(max) {
    try {
      FileSelectFileData.setMaxSingleSize(max);
    } catch (e) {
      throw new Error(rewriteError(e.message));
    }
  }

  /**
   * Set the maximum total byte size allowed for all files
   *
   * @returns {number}
   */
  static setMaxTotalSize(max) {
    try {
      this.#maxTotalSize = getValidMaxTotalSize(max);
    } catch (e) {
      throw new Error(rewriteError(e.message));
    }
  }

  //  END:  Static getter & setter methods
  // ----------------------------------------------------------------
  // START: Constructor method

  constructor(canvas = null, watcher = null, config = null) {
    this._comms = new FileSelectCommunicator(watcher, config.logging);
    this._fileList = [];
    this._totalSize = 0;
    this._processingCount = 0;
    this._log = [];

    try {
      const { logging, ...tmpConfig } = config;
      this._setConfig(tmpConfig);
    } catch (e) {
      throw Error(e.message);
    }

    const noResize = ImageProcessor.canResize() === false;

    this._canResize = (this.imagesAllowed() === true && noResize === false);

    if (this._canResize === true) {
      this._imgProcessor = new ImageProcessor(canvas, this._config, this._comms);
      this._imgProcessor.forceInit();
      this._comms.addWatcher(this._handleImageMeta(this), 'FileSelectFileList--image-resize');
    } else if (noResize === true) {
      this._comms.dispatch('noResize', true, 'FileSelectFileList');
    }
  }

  //  END:  Constructor methods
  // ----------------------------------------------------------------
  // START: private methods

  _handleImageMeta(context) { // eslint-disable-line class-methods-use-this
    return (type, data) => {
      if (type === 'imageMetaSet') {
        const tmp = this.getFile(data);

        if (tmp !== null) {
          context._processImage(tmp);
        }
      }
    };
  }

  /**
   * Add a file to the list of files to upload (if it's OK to do so)
   *
   * > __Note:__ If type of a file is an image and it needs to be
   * >           resized, this method will be called twice. Once when
   * >           the file is identified as an image and then again
   * >           when resizing is complete.
   *
   * @param {FileDataItem} fileData File data object currently being
   *                            processed
   *
   * @returns {boolean|null} TRUE if the file was added to the list.
   *                         FALSE if it wasn't added and
   *                         NULL if it replaced an existing file.
   */
  _addFileToList(fileData) {
    if (this._config.omitInvalid === true && fileData.ok === false) {
      return false;
    }

    if (typeof this._fileList.find((item) => item.isMatch(fileData.id, fileData.name)) !== 'undefined') {
      return null;
    }

    // Only add new files if we are still under the maximum total
    // upload size AND the maximum upload count OR we don't care
    // about invalid files
    if (this._config.omitInvalid === false
      || (this.tooBig() === false && this.tooMany() === false)
    ) {
      fileData.position = this._fileList.length; // eslint-disable-line no-param-reassign

      this._fileList.push(fileData);

      return true;
    }

    return false;
  }

  /**
   * Calculate the total size of all the files in the file list
   *
   * @param {FileDataItem} fileData File data object currently being
   *                            processed
   *
   * @returns {void}
   */
  _calculateTotal(fileData) {
    let sum = 0;
    for (const _file of this._fileList) {
      sum += _file.size;
    }

    this._totalSize = sum;

    if (this.tooBig() === true) {
      this._dispatch(
        'toobig',
        {
          name: fileData.name,
          size: this._config.totalSize,
          max: this._config.maxTotalSize,
        },
      );
    }
  }

  _checkTooMany(name) {
    if (this.tooMany()) {
      this._dispatch(
        'toomany',
        {
          name,
          count: this._fileList.length,
          max: this._config.maxFileCount,
        },
      );
    }
  }

  _dispatch(type, data) {
    this._comms.dispatch(type, data, 'FileSelectFileList');
  }

  /**
   *
   * @param {FileDataItem} fileData File data object currently being
   *                            processed
   * @param {number}       inc  The amount to decrement the
   *                            processing count
   *
   * @returns {void}
   */
  _finaliseProcessing(fileData, inc = 0, newName = null) {
    this._processingCount -= inc;

    if (typeof newName === 'string') {
      fileData.name = newName; // eslint-disable-line no-param-reassign
      this._dispatch('renamed', fileData.id);
    }

    fileData.processing = false; // eslint-disable-line no-param-reassign

    this._dispatch('complete', fileData.id);
    this._dispatch('updated', fileData.id);

    this._checkTooMany(fileData.name);

    this._calculateTotal();

    this._dispatch('allcomplete', (this._processingCount === 0));
  }

  _append(message) {
    this._log.push({
      time: Date.now(),
      message,
    });

    this._dispatch('log', message);
  }

  /**
   *
   * @param {FileSelectFileData} fileData
   */
  async _processImage(fileData) {
    if (this._canResize === true && fileData.isImage === true && fileData.replaceCount === 0) {
      this._imageCount += 1;

      if (fileData.tooLarge === true
        || fileData.tooHeavy === true
        || this._config.greyScale === true
      ) {
        this._processingCount += 1;
        this._dispatch('processingimage', fileData.id);

        await fileData.process(this._imgProcessor);

        this._dispatch('endprocessingimage', fileData.id);
        this._processingCount -= 1;
      }
    }

    this._dispatch('processed', fileData.id);
    this._dispatch('processCount', this._processingCount);
  }

  async _processSingleFileInner(fileData) {
    this._dispatch('processing', fileData.name);

    if (fileData.invalid === true) {
      this._dispatch('invalid', fileData.name);
    }

    if (fileData.tooHeavy === true) {
      this._dispatch(
        'oversize',
        {
          id: fileData.id,
          name: fileData.name,
          size: fileData.size,
          max: this._config.maxSingleSize,
        },
      );
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
  async _processSingleFile(file) {
    if (this._config.omitInvalid === false
      || (this.tooBig() === false && this.tooMany() === false)
    ) {
      console.group('FileSelectFileList._processSingleFile()');
      console.log('this._config:', this._config);
      const fileData = new FileSelectFileData(file, this._config, this._comms);
      console.groupEnd();

      if (this._config.omitInvalid === false || fileData.ok === true) {
        this._addFileToList(fileData);

        this._processSingleFileInner(fileData);
        this._dispatch(
          'added',
          {
            cannotadd: false,
            id: fileData.id,
            invalid: fileData.invalid,
            isImage: fileData.isImage,
            name: fileData.name,
            ogName: fileData.ogName,
            oversize: fileData.tooHeavy,
          },
        );

        return true;
      }

      this._dispatch(
        'notadded',
        {
          name: file.name,
          cannotadd: true,
          oversize: fileData.tooHeavy,
          invalid: fileData.invalid,
        },
      );

      return false;
    }

    this._dispatch(
      'notadded',
      {
        name: file.name,
        cannotadd: true,
        tooBig: this.tooBig(),
        tooMany: this.tooMany(),
        size: this._totalSize,
        count: this._fileList.length,
      },
    );

    return false;
  }

  _setConfig(config) {
    this._config = {
      allowedTypes: FileSelectFileData.getDefaultAllowed(),
      greyScale: ImageProcessor.getGreyscale(),
      jpegCompression: ImageProcessor.getJpegCompression(),
      maxFileCount: FileSelectFileList.#maxFileCount,
      maxImgPx: ImageProcessor.getMaxImgPx(),
      maxSingleSize: FileSelectFileData.getMaxSingleSize(),
      maxTotalSize: FileSelectFileList.#maxTotalSize,
      omitInvalid: FileSelectFileList.#omitInvalid,
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

    try {
      this._config = overrideConfig(this._config, config);
    } catch (error) {
      console.error('FileSelectFileData._setConfig():', error.message);
      throw Error(error.message);
    }
  }

  //  END:  private methods
  // ----------------------------------------------------------------
  // START: Public getter methods

  /**
   * Get message based on supplied type
   *
   * @param {string} type Type of message to return
   *
   * @throws {Error} If message type could not be found
   */
  getMessage(type, fileID = '') {
    if (typeof type !== 'string' || type.trim() === '') {
      throw new Error(
        'FileSelectFileList.getMessage() expects only parameter '
        + 'type to be a non-empty string',
      );
    }

    if (typeof this._config.messages[type] !== 'string') {
      throw new Error(
        'FileSelectFileList.getMessage() expects only parameter '
        + 'type to be a string matching one of the following types: '
        ,
      );
    }

    let output = this._config.messages[type];

    let bits = {
      FILE_COUNT: this._fileList.length,
      MAX_COUNT: this._config.maxFileCount,
      MAX_SINGLE: this._config.maxSingleSize,
      MAX_TOTAL: this._config.maxTotalSize,
      TOTAL_SIZE: this._totalSize,
    };

    switch (type) { // eslint-disable-line default-case
      case 'tooBigFile':
        const tmp = this.getFile(fileID); // eslint-disable-line no-case-declarations

        if (tmp !== null) {
          bits = {
            ...bits,
            FILE_NAME: tmp.name,
            FILE_SIZE: tmp.size,
          };
        }
        output = enhanceMessage(output, bits, true);
        break;

      case 'tooMany':
        output = enhanceMessage(output, bits);
        break;

      case 'tooBigTotal':
        output = enhanceMessage(output, bits, true);
        break;
    }

    return output;
  }

  imagesAllowed() {
    return typeof this._config.allowedTypes.find((item) => (item.type === 'image')) !== 'undefined';
  }

  /**
   * The number of bad files in the list
   *
   * @returns {number}
   */
  badFileCount() { return this.getFileCount(false); }

  getAllowedTypes() { return this._config.allowedTypes; }

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
  getAllFiles(onlyGood = null) {
    if (onlyGood === null) {
      return this._fileList.map(cloneFileDataItem);
    }

    return this._fileList.filter(fileIsGood(onlyGood)).map(cloneFileDataItem);
  }

  getAllFilesRaw() { return this._fileList; }

  /**
   * Get a list of only the bad files (and metadata)
   *
   * @returns {FileDataItem[]}
   */
  getBadFiles() { return this.getAllFiles(false); }

  /**
   * Get the dispatcher function being used in this instance
   *
   * @returns {Dispatcher}
   */
  getComms() { return this._comms; }

  /**
   * Gett a file mattched by the supplied ID
   *
   * @param {string} id ID of the file to be returned
   *
   * @returns {FileSelectFileData|null} The file object if a file was
   *
   *
   * matched by its ID. NULL otherwise
   */
  getFile(id, name = '') {
    const output = this._fileList.find((item) => item.isMatch(id, name));

    return (typeof output !== 'undefined')
      ? output
      : null;
  }

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
  getFileCount(onlyGood = null) {
    if (onlyGood === null) {
      return this._fileList.length;
    }

    let output = 0;
    for (const fileData of this._fileList) {
      if (fileData.ok === onlyGood) {
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
  getGoodFiles() { return this.getAllFiles(true); }

  /**
   * Get some basic data about the current state of FileSelectData
   *
   * @returns {Object}
   */
  getStatus() {
    const tooMany = this.tooMany();
    const tooBig = this.tooBig();
    const badFiles = this.badFileCount();
    const ok = (tooBig === false && tooMany === false && badFiles > 0);

    return {
      badFiles,
      count: this._fileList.length,
      ok,
      processing: this._processingCount,
      size: this._totalSize,
      tooBig,
      tooMany,
    };
  }

  /**
   * The number of files that are safe to upload
   *
   * @returns {number}
   */
  goodFileCount() { return this.getFileCount(true); }

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
  hasFiles(onlyGood = null) {
    if (onlyGood === null) {
      return (this._fileList.length > 0);
    }

    for (const fileData of this._fileList) {
      if (fileData.ok === onlyGood) {
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
  hasBadFiles() { return this.hasFiles(false); }

  /**
   * Whether or not there are any files that are OK to be uploaded
   *
   * @returns {boolean}
   */
  hasGoodFiles() { return this.hasFiles(true); }

  /**
   * Whether or not images are still being processed
   *
   * @returns {boolean}
   */
  isProcessing() { return this._processingCount > 0; }

  /**
   * Get the maximum number of files allowed
   *
   * @returns {number}
   */
  maxFiles() { return this._config.maxFileCount; }

  /**
   * Get the maximum pixel count (in either direction) currently
   * allowed for images
   *
   * @returns {number}
   */
  maxPx() { return this._config.maxImgPx; }

  /**
   * Get the maximum byte size allowed for a single file
   *
   * @returns {number}
   */
  maxSingleSize() { return this._config.maxSingleSize; }

  /**
   * Get the maximum total byte size allowed for all files
   *
   * @returns {number}
   */
  maxTotalSize() { return this._config.maxTotalSize; }

  allowMultiple() {
    return (this._config.maxFileCount > 1 && this._config.maxFileCount > this._fileList.length);
  }

  /**
   * Whether or not it would be OK to upload the selected files as is
   *
   * @returns {boolean}
   */
  ok() {
    return (this.tooBig() === false
      && this.tooMany() === false
      && this.hasBadFiles() === false
      && this._fileList.length > 0);
  }

  /**
   * Get the omit invalid state
   *
   * @returns {boolean}
   */
  omitInvalid() { return this._config.omitInvalid; }

  /**
   * Whether or not the total size of selected files is larger than
   * the maximum allowed
   *
   * @returns {boolean}
   */
  tooBig() {
    return (this._totalSize > this._config.maxTotalSize);
  }

  /**
   * Whether or not there are already too many files selected
   *
   * @returns {boolean}
   */
  tooMany() {
    return (this._fileList.length > this._config.maxFileCount);
  }

  /**
   * Get the total size in bytes for all the files in the list
   *
   * @returns {number}
   */
  totalSize() { return this._totalSize; }

  //  END:  Public getter methods
  // ----------------------------------------------------------------
  // START: General public methods

  /**
   * Add another dispatcher function
   *
   * @param {Function} dispatcher A function that can be used as an
   *                              event handler
   * @param {string}   id         ID of the dispatcher (so it can be
   *                              replaced or removed)
   * @param {boolean}  replace    If a dispatcher already exists,
   *                              replace it with the new dispatcher
   *                              function
   *
   * @throws {Error} If dispatcher was not a function
   * @throws {Error} If id was not a string or was empty
   * @throws {Error} If a dispatcher with the same ID already exists
   *                 and `replace` is FALSE
   */
  addWatcher(watcher, id, replace = false) {
    try {
      this._comms.addWatcher(watcher, id, replace);
    } catch (error) {
      // throw Error(error.message);
    }
  }

  /**
   * Remove a dispatcher function
   *
   * @param {string} id ID of the dispatcher function to be removed.
   *
   * @returns {boolean} TRUE if the dispatcher was removed.
   *                    FALSE otherwise
   */
  removeWatcher(id) {
    return this._comms.removeWatcher(id);
  }

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
  clean(deleteExcess = false) {
    this._fileList = this._fileList.filter(fileIsOK);

    // Update the total upload size
    this._calculateTotal();

    if (deleteExcess !== true) {
      return true;
    }

    if (this.tooMany()) {
      const diff = this._fileList.length - this._config.maxFileCount;
      this._fileList = this._fileList.splice(this._config.maxFileCount - 1, diff);
    }

    if (this.tooBig() === true) {
      for (let a = this._fileList.length - 1; a >= 0; a -= 1) {
        this._fileList.pop();

        this._calculateTotal();
        if (this.tooBig() === false) {
          return true;
        }
      }
    }
    return false;
  }

  getLog() { return this._log; }

  clearLog() { this._log = []; }

  /**
   * Remove a file from the list of files selected by the user
   *
   * @param {string} name
   *
   * @returns {boolean} TRUE if file was deleted. FALSE otherwise
   */
  deleteFile(id) {
    const l = this._fileList.length;

    const outGoing = this.getFile(id);

    if (outGoing !== null) {
      this._fileList = this._fileList.filter((fileData) => (fileData.id !== id)).map(resetPos);

      this._calculateTotal();
      this._checkTooMany(outGoing.name);
      this._dispatch('deleted', id);
    }

    return (this._fileList.length < l);
  }

  deleteAll() {
    this._fileList = [];
    this._totalSize = 0;
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
  getFileList(onlyGood = null) {
    const output = new DataTransfer();

    for (const fileData of this._fileList) {
      if (onlyGood === null || (onlyGood === fileData.ok)) {
        output.items.add(fileData.file);
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
  async getFormData(data = null, includeBad = false) {
    const promises = [];
    const form = new FormData();

    for (const fileData of this._fileList) {
      if (includeBad === true || fileData.ok === true) {
        promises.push(Promise.resolve(form.append('File', fileData)));
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

  _moveFileInner(id, pos, relPos) {
    const max = this._fileList.length - 1;
    const from = pos;
    let to = pos + relPos;

    if (to === pos) {
      return false;
    }

    if (to < pos && to < 0) {
      if (pos === 0) {
        return false;
      }

      to = 0;
    } else if (to > pos && to > max) {
      if (pos >= max) {
        return false;
      }
      to = max;
    }

    const item = this._fileList[from];
    this._fileList.splice(from, 1);
    this._fileList.splice(to, 0, item);

    this._fileList = this._fileList.map(resetPos);
    this._dispatch('moved', id);

    return true;
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
  moveFile(id, relPos) {
    for (let a = 0; a < this._fileList.length; a += 1) {
      if (this._fileList[a].id === id) {
        return this._moveFileInner(id, a, relPos);
      }
    }

    return false;
  }

  /**
   * Process file(s) provided by `<input type="file" />` and add them
   * to the list of files a user wants to update.
   *
   * > __Note:__ While this function returns immediately, various
   * >           events are dispatched via the `dispatcher` provided
   * >           to the constructor if images can be resized, a
   * >           promise will be envoked
   *
   * @param {FileList} files
   *
   * @returns {Object}
   */
  processFiles(files) {
    if ((files instanceof FileList) === false || files.length === 0) {
      throw new Error(
        'FileSelectData.processFiles() expects only argument to be '
        + 'an instance of FileList containing at least one file',
      );
    }

    const c = this._fileList.length;
    const newFiles = [];

    this._dispatch('toBeAdded', files.length);

    for (const fileData of files) {
      newFiles.push(this._processSingleFile(fileData));
    }

    const diff = (this._fileList.length - c);

    return {
      ...this.getStatus(),
      newFiles,
      count: files.length,
      added: diff,
      multi: diff > 1,
    };
  }

  replaceFile(id, file) {
    const tmp = this.getFile(id);

    if (tmp !== null) {
      tmp.file = file;

      this._processSingleFileInner(tmp);

      return true;
    }

    throw new Error(
      `Could not replace file matching ID: "${id}" (name: `
      + `"${file.name})" because original file could not be found`,
    );
  }

  //  END:  General public methods
  // ----------------------------------------------------------------
}

export default FileSelectFileList;
