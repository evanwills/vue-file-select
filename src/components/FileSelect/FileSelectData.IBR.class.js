import imageBlobReduce from 'image-blob-reduce';
import {
  cloneFileDataItem,
  dummyDispatch,
  getAllowedTypes,
  getEventTypes,
  getRightConfigValidateFunc,
  getUniqueFileName,
  getValidMaxFileCount,
  getValidMaxImgPx,
  getValidMaxSingleSize,
  getValidMaxTotalSize,
  isValidFileType,
  resetPos,
  rewriteConfigError,
  rewriteError,
} from './file-select-utils';
import { isObj } from '../../utils/data-utils';
import { FileSelectData } from './FileSelectData.class';

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

//  END:  Local type definitions
// ==================================================================

/**
 * Handle all the data related parts of preparing user selected files
 * for upload to a server.
 *
 * @class FileSelectData
 *
 * @param {Dispatcher|null} dispatcher Function to be called to
 *                                     inform the client about
 *                                     things that happen while
 *                                     processing a file.
 * @param {Object|null}     config     Values to override the static
 *                                     (default) config values that
 *                                     control limits
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
export class FileSelectDataIBR extends FileSelectData {
  static #imgResize = null;

  constructor (dispatcher = null, config = null) {
    super(dispatcher, config);
  }

  //  END:
  // ----------------------------------------------------------------
  // START: Static getter & setter methods

  //  END:  Static methods
  // ----------------------------------------------------------------
  // START: private methods

  /**
   * Get a callback function to pass to `ImageBlobReduce.toBlob().then()`
   * to handle successful resizing of an image
   *
   * @param {FileSelectData} context
   * @param {FileDataItem}   file    File data object currently being
   *                                 processed
   * @returns {Function<{Blob}}}
   */
  #processImageBlobThen (context, file) {
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

      context._addFileToList(file);
      context._finaliseProcessing(file, 1);
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
  #processImageBlobCatch (context, file) {
    return (error) => {
      context._logError(error.message);

      if (error.message.includes('Pica: cannot use getImageData on canvas')) {
        FileSelectData._noResize = true;
      }

      context._processOverSizedFile(file, true);
      context._finaliseProcessing(file, 1);
    }
  }

  _processImage (file) {
    super(file);

    if (FileSelectDataIBR.#imgResize === null) {
      FileSelectDataIBR.#imgResize = new imageBlobReduce();
    }

    FileSelectDataIBR._imgResize.toBlob(file, { max: this._config.maxImgPx })
      .then(this.#processImageBlobThen(this, tmp))
      .catch(this.#processImageBlobCatch(this, tmp));
  }

  //  END:  private methods
  // ----------------------------------------------------------------
  // START: Public getter methods

  //  END:  Public getter methods
  // ----------------------------------------------------------------
  // START: General public methods

  //  END:  General public methods
  // ----------------------------------------------------------------
}
