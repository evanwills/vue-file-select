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
import { ComponentCommunicator } from '../../../utils/ComponentCommunicator.class';
import { isObj } from '../../../utils/data-utils';
import { FileSelectData } from './FileSelectData.class';
import { humanReadableList } from '../../../utils/general-utils';
import ImageProcessor from './ImageProcessor.IBR.class';
import ConsoleLogger from '../../../utils/ConsoleLogger.class';
// import ImageProcessor from ./ImageProcessor.photon.class

// ==================================================================
// START: Local type definitions

/* eslint-disable vue/max-len, max-len */
/**
 * @typedef {import('../../../../../types/upload-button.d.ts').FileDataItem} FileDataItem;
 * @typedef {import('../../../../../types/upload-button.d.ts').Watcher} Watcher;
 * @typedef {import('../../../../../types/upload-button.d.ts').FileSelectListConfigParam} FileSelectListConfigParam;
 * @typedef {import('../../../../../types/upload-button.d.ts').FileSelectListInternalConfig} FileSelectListInternalConfig;
 */
/* eslint-enable vue/max-len, max-len */

//  END:  Local type definitions
// ==================================================================

/**
 * Handle all the data related parts of preparing user selected files
 * for upload to a server.
 *
 * @class FileSelectData
 *
 * @param {HTMLCanvasElement|null} canvas Object that can be used to
 *                      manipulate images
 * @param {FileSelectListConfigParam} config Values to override the
 *                      static (default) config values that control
 *                      limits
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
export class FileSelectList {
  // ----------------------------------------------------------------
  // START: Define static properties

  static #maxFileCount = 15;

  static #maxTotalSize = 47185920;

  static #omitInvalid = true;

  //  END:  Define static properties
  // ----------------------------------------------------------------
  // START: Define instance properties

  _addingCount = 0;

  _badFiles = [];

  _busy = false;

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
   * @property {FileSelectListInternalConfig}
   */
  _config;

  /**
   * Function to dispatch events to the client.
   *
   * @property {ComponentCommunicator} _comms
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

  _cLog = null;

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
  // START: Constructor method

  /**
   *
   * @param {HTMLCanvasElement|null}    canvas HTML Canvas element (if available)
   *                                           NOTE: Without a canvas
   *                                                 element, it is not possible
   *                                                 to resize images.
   * @param {FileSelectListConfigParam} config Config settings to override default
   *                                           FileSelectList config settings
   */
  constructor(canvas = null, config = null, comms = null) {
    this._comms = (comms !== null && comms instanceof ComponentCommunicator)
      ? comms
      : new ComponentCommunicator(config.logging);
    this._fileList = [];
    this._totalSize = 0;
    this._processingCount = 0;
    this._addingCount = 0;
    this._log = [];
    this._badFiles = [];

    const { logging, noResize, ...tmpConfig } = config;

    try {
      this._setConfig(tmpConfig);
    } catch (e) {
      throw Error(e.message);
    }

    this._canResize = (this.imagesAllowed() === true && noResize !== true);

    if (this._canResize === true) {
      this._imgProcessor = new ImageProcessor(canvas, this._config, this._comms);
      this._imgProcessor.forceInit();
    } else if (noResize === true) {
      this._comms.dispatch('noResize', true, 'FileSelectList');
    }
    this._cLog = new ConsoleLogger('FileSelectList', '', { _this: this });

    if (this._comms.watcherExists('imageProcessingStart', 'FileSelectList') === false) {
      this._comms.addWatcher('imageProcessingStart', 'FileSelectList', this._handleProcesStart());
      this._comms.addWatcher('imageProcessingEnd', 'FileSelectList', this._handleProcesEnd());
    }
  }

  //  END:  Constructor methods
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
  static getMaxSingleSize() { return FileSelectData.maxSingleSize(); }

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
      FileSelectData.setAllowedTypes(allowedTypes);
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
      FileSelectData.setMaxImgPx(px);
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
      FileSelectData.setMaxSingleSize(max);
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
  // START: private methods

  _handleProcesStart() {
    const context = this;
    return () => {
      context._cLog.before('_handleProcesStart', { _this: ['_processingCount', '_addingCount'] });

      context._processingCount += 1;
      context._dispatch('procesCountChange', context._processingCount);

      context._cLog.after('_handleProcesStart', { _this: ['_processingCount', '_addingCount'] });
    };
  }

  _handleProcesEnd() {
    const context = this;
    return () => {
      context._cLog.before('_handleProcesEnd', { _this: ['_processingCount'] });
      context._processingCount -= 1;
      context._dispatch('procesCountChange', context._processingCount);

      context._dispatch('allcomplete', (this._processingCount === 0));
      context._cLog.after('_handleProcesEnd', { _this: ['_processingCount'] });
    };
  }

  /**
   * Add the ID of a bad file if it's not already in the list.
   *
   * @param {string} id ID of bad file added to the file list
   *
   * @returns {void}
   */
  _addBadFile(id) {
    if (this._badFiles.includes(id) === false) {
      this._badFiles.push(id);
    }
  }

  /**
   * Remove the ID of a bad file from the bad file ID list.
   *
   * @param {string} id ID of a bad file that was removed from the
   *                    file list.
   *
   * @returns {void}
   */
  _deleteBadFile(id) {
    this._badFiles = this._badFiles.filter((str) => str !== id);
  }

  _isDuplicate(fileData) {
    return (typeof this._fileList.find((item) => item.isSame(fileData)) !== 'undefined');
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

    if (this._isDuplicate(fileData) === true) {
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

      if (fileData.ok === false) {
        this._addBadFile(fileData.id);
      }

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
  _calculateTotal() {
    let sum = 0;
    for (const _file of this._fileList) {
      sum += _file.size;
    }

    this._totalSize = sum;

    if (this.tooBig() === true) {
      this._dispatch(
        'toobig',
        {
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
    this._comms.dispatch(type, data, 'FileSelectList');
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

    this._dispatch('allcomplete', (this._processingCount === 0 && this._addingCount === 0));
  }

  _append(message) {
    this._log.push({
      time: Date.now(),
      message,
    });

    this._dispatch('log', message);
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

  _handleDuplicate(fileData) {
    this._dispatch(
      'duplicate',
      fileData.ogName,
    );
  }

  async _handleAdding(fileData) {
    this._cLog.before('_handleAdding', { local: { fileData }, _this: ['_addingCount'] });
    const action = this._addFileToList(fileData);

    if (action === true) {
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
          duplicate: false,
        },
      );

      this._calculateTotal();
    } else if (action === null) {
      // file is duplicate;
      this._handleDuplicate(fileData);
    }
    this._addingCount -= 1;
    this._cLog.after('_handleAdding', { _this: ['_addingCount'] });
  }

  _handleNotOK(file, fileData) {
    this._dispatch(
      'notadded',
      {
        name: file.name,
        cannotadd: true,
        oversize: fileData.tooHeavy,
        invalid: fileData.invalid,
        duplicate: false,
      },
    );
  }

  _handleOverSize(file) {
    this._dispatch(
      'notadded',
      {
        name: file.name,
        cannotadd: true,
        tooBig: this.tooBig(),
        tooMany: this.tooMany(),
        size: this._totalSize,
        count: this._fileList.length,
        duplicate: false,
      },
    );
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
      const fileData = new FileSelectData(
        file,
        this._config,
        this._comms,
        this._imgProcessor,
      );

      if (this._config.omitInvalid === false || fileData.ok === true) {
        this._handleAdding(fileData);
        return true;
      }

      this._handleNotOK(file, fileData);
      this._addingCount -= 1;
      return false;
    }

    this._handleOverSize(file);
    this._addingCount -= 1;
    return false;
  }

  _setConfig(config) {
    this._config = {
      allowedTypes: FileSelectData.getDefaultAllowed(),
      greyScale: ImageProcessor.getGreyscale(),
      jpegCompression: ImageProcessor.getJpegCompression(),
      maxFileCount: FileSelectList.#maxFileCount,
      maxImgPx: ImageProcessor.getMaxImgPx(),
      maxSingleSize: FileSelectData.getMaxSingleSize(),
      maxTotalSize: FileSelectList.#maxTotalSize,
      omitInvalid: FileSelectList.#omitInvalid,
      messages: {
        duplicate: 'We do not allow multiple copies of the same '
          + 'file to be uploaded. The duplicate of [[FILE_NAME]] '
          + 'was discarded.',
        noResize: 'This browser does not support image resizing. '
          + 'Please use a supported browser like Chrome or Firefox.',
        tooBigFile: 'File size ([[FILE_SIZE]]) exceeds allowable '
          + 'limit ([[MAX_SINGLE]]).',
        tooBigTotal: 'Total size of upload exceeds allowable limit.',
        tooMany: 'Maximum number of files has been exceeded.',
        invalidType: 'We detected an invalid file type. '
          + 'Valid file types are: [[TYPE_LIST]]',
      },
    };

    try {
      this._config = overrideConfig(this._config, config);
    } catch (error) {
      console.error('FileSelectData._setConfig():', error.message);
      throw Error(error.message);
    }
  }

  //  END:  private methods
  // ----------------------------------------------------------------
  // START: Public getter methods

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

  getBadFileIssues() {
    if (this.badFileCount() === 0) {
      return [];
    }
    const issues = ['invalid', 'tooHeavy', 'tooLarge'];
    const output = [];
    for (const file of this._fileList) {
      // Go through all files to see if any of them have any issues
      for (const issue of issues) {
        if (file[issue] === true && output.includes(issue) === false) {
          // This file has an issue we haven't seen before
          output.push(issue);

          if (output.length === 3) {
            // we've got the full set, no need to keep trying
            return output;
          }
        }
      }
    }

    return output;
  }

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
   * @returns {FileSelectData|null} The file object if a file was
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

  isBusy() {
    return (this._busy === true || this._addingCount > 0 || this._processingCount > 0);
  }

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
  tooBig() { return (this._totalSize > this._config.maxTotalSize); }

  /**
   * Whether or not there are already too many files selected
   *
   * @returns {boolean}
   */
  tooMany() { return (this._fileList.length > this._config.maxFileCount); }

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
  addWatcher(event, id, watcher, replace = false) {
    if (this._comms !== null
      && (this._comms.watcherExists(event, id) === false || replace === true)
    ) {
      try {
        this._comms.addWatcher(event, id, watcher, replace);
      } catch (error) {
        console.error('error.message:', error.message);
        // throw Error error message
      }
    }
  }

  /**
   * Append all good files to FormData object so they can be sent
   * back to the server.
   *
   * > __Note:__ This appends only the File objects to the form, all
   * >           the metadata associated with the file is omitted
   * >           from the form.
   *
   * @param {FormData} form A DOM form object to which files can be
   *                        appended.
   *
   * @returns {FormData} Same FormData object with uploadable files
   *                     appended.
   */
  async appendFilesToForm(form) {
    const promises = [];
    const tmp = this.getGoodFiles();

    for (const fileData of tmp) {
      promises.push(
        Promise.resolve(form.append('File', fileData._file, fileData._name)),
      );
    }

    await Promise.all(promises);

    return form;
  }

  busyStatus() { return this._busy; }

  /**
   * Remove a dispatcher function
   *
   * @param {string} id ID of the dispatcher function to be removed.
   *
   * @returns {boolean} TRUE if the dispatcher was removed.
   *                    FALSE otherwise
   */
  removeWatcher(event, id) {
    return this._comms.removeWatcher(event, id);
  }

  removeWatchersByID(id) {
    return this._comms.removeWatchersByID(id);
  }

  /**
   * Remove bad files AND (optionally) there are too many files,
   * Remove suplus files plus, if the total upload size is too large
   * Recursively remove the last file, until the upload size is below
   * the maximum allowed.
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
      this._fileList = this._fileList.map(resetPos);
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
          this._fileList = this._fileList.map(resetPos);
          return true;
        }
      }
    }

    this._fileList = this._fileList.map(resetPos);

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

      this._deleteBadFile(id);

      this._calculateTotal();
      this._checkTooMany(outGoing.name);
      this._dispatch('deleted', id);
    }

    return (this._fileList.length < l);
  }

  deleteAll() {
    this._fileList = [];
    this._totalSize = 0;
    this._dispatch('deleteAll', Date.now());
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

  getDuplicateMsg(files) {
    const FILE_NAME = humanReadableList(files);

    return this._config.messages.duplicate.replace('[[FILE_NAME]]', FILE_NAME);
  }

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
        'FileSelectList.getMessage() expects only parameter '
        + 'type to be a non-empty string',
      );
    }

    if (typeof this._config.messages[type] !== 'string') {
      throw new Error(
        'FileSelectList.getMessage() expects only parameter '
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

    const tmp = this.getFile(fileID); // eslint-disable-line no-case-declarations

    if (tmp !== null) {
      bits = {
        ...bits,
        FILE_NAME: tmp.name,
        FILE_SIZE: tmp.size,
      };
    }

    switch (type) { // eslint-disable-line default-case
      case 'tooBigFile':
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
        'FileSelectList.processFiles() expects only argument to be '
        + 'an instance of FileList containing at least one file',
      );
    }

    const c = this._fileList.length;
    const newFiles = [];
    this._addingCount = files.length;

    this._dispatch('toBeAdded', files.length);

    for (const fileData of files) {
      newFiles.push(this._processSingleFile(fileData));
    }

    const diff = (this._fileList.length - c);
    this._busy = false;

    return {
      ...this.getStatus(),
      newFiles,
      count: files.length,
      added: diff,
      multi: diff > 1,
    };
  }

  replaceFile(id, file) {
    this._cLog.only('replaceFile', { local: { id, file } });
    const tmp = this.getFile(id);

    this._addingCount = 1;

    if (tmp !== null) {
      tmp.replaceFile(file);

      this._processSingleFileInner(tmp);
      this._addBadFile(id);

      this._addingCount -= 1;
      this._busy = false;

      return true;
    }

    throw new Error(
      `Could not replace file matching ID: "${id}" (name: `
      + `"${file.name})" because original file could not be found`,
    );
  }

  setBusy() {
    this._busy = true;
  }

  notBusy() {
    this._busy = false;
  }

  //  END:  General public methods
  // ----------------------------------------------------------------
}

export default FileSelectList;
