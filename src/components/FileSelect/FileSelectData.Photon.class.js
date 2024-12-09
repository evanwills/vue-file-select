import { FileSelectData } from './FileSelectData.class';

// ==================================================================
// START: Local type definitions

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
 */
export class FileSelectDataPhoton extends FileSelectData {
  static #imgResize = null;

  #canvas;

  constructor (dispatcher = null, config = null, canvas = null) {
    super(dispatcher, config);

    if (canvas === null || (canvas instanceof HTMLCanvasElement) === false) {
      throw new Error(
        'FileSelectDataPhoton constructor expects third argument '
        + '`canvas` to be an instance of an HTML canvas '
        + 'element/DOM node.',
      )
    }
  }

  //  END:
  // ----------------------------------------------------------------
  // START: Static getter & setter methods

  static #setPhoton (photon) {
    this.#imgResize = photon;
  }

  //  END:  Static methods
  // ----------------------------------------------------------------
  // START: private methods

  #processImg(file) {
    // See documentation:
    // https://silvia-odwyer.github.io/photon/guide/using-photon-web/

    const ctx = canvas.getContext("2d");

    // Draw the image element onto the canvas
    ctx.drawImage(file.file, 0, 0);

    // Convert the ImageData found in the canvas to a PhotonImage (so that it can communicate with the core Rust library)
    let image = photon.open_image(canvas, ctx);

    photon.reisze(image, )
    if (this._config.greyScale === true) {
      photon.greyscale(image);
    }

    // Place the modified image back on the canvas
    photon.putImageData(canvas, ctx, image);

    this._finaliseProcessing(file, 1);
  }

  #initPhoton (file) {
    const setPhoton = FileSelectDataPhoton.#setPhoton;
    const proccessImg = this.#processImg;

    return (photon) => {
      setPhoton(photon);
      return proccessImg(file);
    };
  }

  async _processImage (file) {
    if (FileSelectDataPhoton.#imgResize === null) {
      import("@silvia-odwyer/photon").then(this.#initPhoton(file));
    } else {
      this.#processImg(file);
    }
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
