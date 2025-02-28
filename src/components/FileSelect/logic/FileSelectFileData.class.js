import { nanoid } from 'nanoid';
import {
  getAllowedTypes,
  getFileExtension,
  getUniqueFileName,
  getValidMaxSingleSize,
  isValidFileType,
  overrideConfig,
  rewriteConfigError,
  rewriteError,
} from './file-select-utils';
import { fileIsImage, getImageMetadata } from './image-processor-utils';
import { FileSelectCommunicatorLogging as FileSelectCommunicator } from './FileSelectCommunicatorLogging.class';

export class FileSelectDataFile {
  // ----------------------------------------------------------------
  // START: Define static properties

  static _defaultAllowed = [];

  static _maxSingleSize = 15728640;

  //  END:  Define static properties
  // ----------------------------------------------------------------
  // START: Define instance properties

  _ext;

  _file;

  _id = null;

  _imgMeta = null;

  _invalid = false;

  _isImage = false;

  _metaWaiting = false;

  _mime;

  _name;

  _ogName;

  _ogSize;

  _ok = true;

  _position = -1;

  _previousName;

  _processing = false;

  _replaceCount = 0;

  _src = '';

  _tooLarge = null;

  _config;

  /**
   * @property {ImageProcessor|null}
   */
  _comms = null;

  //  END:  Define instance properties
  // ----------------------------------------------------------------
  // START: Static getter & setter methods

  static getDefaultAllowed() { return this._defaultAllowed; }

  static getMaxSingleSize() { return this._maxSingleSize; }

  static setAllowedTypes(allowedTypes) {
    try {
      this._defaultAllowed = getAllowedTypes(allowedTypes);
    } catch (e) {
      throw Error(e.message);
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
      this._maxSingleSize = getValidMaxSingleSize(max);
    } catch (e) {
      throw new Error(rewriteError(e.message));
    }
  }

  //  END:  Static getter & setter methods
  // ----------------------------------------------------------------
  // START: Constructor method

  constructor(file, config = null, comms = null) {
    if (file instanceof File === false) {
      throw new Error(
        'FileSelectDataFile constructor expects first parameter to '
        + `be a File object. ${typeof file} given`,
      );
    }

    this._comms = null;
    this._ext = getFileExtension(file);
    this._file = file;
    this._id = nanoid(8);
    this._invalid = false;
    this._isImage = fileIsImage(file);
    this._metaWaiting = false;
    this._mime = file.type;
    this._name = getUniqueFileName(file.name, this._id);
    this._ogName = file.name;
    this._ogSize = file.size;
    this._ok = true;
    this._position = -1;
    this._previousName = file.name;
    this._processing = false;
    this._replaceCount = 0;
    this._src = '';
    this._tooLarge = null;

    this._setConfig(config);

    this._setOK();

    if (comms !== null && comms instanceof FileSelectCommunicator === true) {
      this._comms = comms;
    }

    if (this._name !== this._ogName) {
      this._dispatch('renamed', this._id);
    }

    if (this._isImage) {
      this._getImgSrc(file);
      this.setImageMetadata(true);
    }
  }

  //  END:  Constructor methods
  // ----------------------------------------------------------------
  // START: Private method

  _getImgSrc(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      this._src = e.target.result;
      this._dispatch('imgSrcSet', this._id);
    };

    reader.readAsDataURL(file);
  }

  _dispatch(type, data) {
    if (this._comms !== null) {
      this._comms.dispatch(type, data, 'FileSelectFileData');
    }
  }

  _setConfig(config) {
    // Preset config with default values

    this._config = {
      defaultAllowed: FileSelectDataFile._defaultAllowed,
      maxSingleSize: FileSelectDataFile._maxSingleSize,
      maxImgPx: 1500,
    };

    try {
      this._config = overrideConfig(this._config, config);
    } catch (error) {
      throw Error(rewriteConfigError(error.message));
    }
  }

  _setOK() {
    if (isValidFileType(this._file, this._config.defaultAllowed) === false) {
      this._invalid = true;
      this._ok = false;
    } else if (this.tooHeavy === true) {
      this._ok = false;
    }
  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public getter & setter methods

  get ext() {
    return this._ext;
  }

  get file() {
    return this._file;
  }

  /**
   * @param {File} file
   */
  set file(file) {
    if (file instanceof File && file !== this._file) {
      this._file = file;
      this._ext = getFileExtension(file);
      this._isImage = fileIsImage(file);
      this._mime = file.type;
      this._replaceCount += 1;
      this._setOK();
      this.setImageMetadata(true);
      this._dispatch('replaced', this._id);
    }
  }

  get id() {
    return this._id;
  }

  get imgMeta() {
    return this._imgMeta;
  }

  get invalid() {
    return this._invalid;
  }

  get isImage() {
    return (this._isImage === true && this._invalid === false);
  }

  get lastModified() {
    return (typeof this._file.lastModifiedDate !== 'undefined')
      ? this._file.lastModifiedDate
      : -1;
  }

  get mime() {
    return this._mime;
  }

  /**
   * @param {string} mime
   */
  set mime(mime) {
    if (typeof mime === 'string') {
      this._mime = mime;
    }
  }

  get name() {
    return this._name;
  }

  /**
   * @param {string} name
   */
  set name(name) {
    if (typeof name === 'string') {
      const tmp = getUniqueFileName(name.trim());
      if (tmp !== '') {
        this._previousName = this._name;
        this._name = tmp;
      }
    }
  }

  get ogName() {
    return this._ogName;
  }

  get ogSize() {
    return this._ogSize;
  }

  get ok() {
    return this._ok;
  }

  /**
   * @param {boolean} ok
   */
  set ok(ok) {
    if (typeof ok === 'boolean') {
      this._ok = ok;
    }
  }

  get position() {
    return this._position;
  }

  /**
   * @param {number} position
   */
  set position(position) {
    if (typeof position === 'number' && position >= 0) {
      this._position = position;
    }
  }

  get previousName() {
    return this._previousName;
  }

  get processing() {
    return this._processing;
  }

  set processing(processing) {
    if (typeof processing === 'boolean') {
      this._processing = processing;
    }
  }

  get replaceCount() {
    return this._replaceCount;
  }

  get size() {
    return this._file.size;
  }

  get src() {
    return this._src;
  }

  set src(src) {
    if (typeof src === 'string' && src.startsWith('data:image/')) {
      this._src = src;
    }
  }

  get tooHeavy() {
    if (this._processing === true) {
      return false;
    }

    return (this._file.size > this._config.maxSingleSize);
  }

  get tooLarge() {
    return this._tooLarge;
  }

  //  END:  Public getter & setter methods
  // ----------------------------------------------------------------
  // START: Public utility methods

  isMatch(id, name = '') {
    return (this._id === id || this._name === name);
  }

  async height() {
    if (this._isImage) {
      return (this._imgMeta !== null)
        ? this._imgMeta.height
        : 0;
    }

    return 0;
  }

  async width() {
    if (this._isImage) {
      return (this._imgMeta !== null)
        ? this._imgMeta.width
        : 0;
    }

    return 0;
  }

  async ogHeight() {
    if (this._isImage) {
      return (this._imgMeta !== null)
        ? this._imgMeta.ogHeight
        : 0;
    }

    return 0;
  }

  async ogWidth() {
    if (this._isImage) {
      return (this._imgMeta !== null)
        ? this._imgMeta.ogWidth
        : 0;
    }

    return 0;
  }

  setImageMetadata(force = false) {
    if (this._isImage === true && this._metaWaiting === false
      && (this._imgMeta === null || force === true)
    ) {
      this._metaWaiting = true;

      return getImageMetadata(this._file).then((result) => {
        this._metaWaiting = false;

        this._imgMeta = (this._imgMeta === null)
          // set the image meta object from scratch
          ? { ...result }
          // merge the latest data into the image meata object
          : {
            ...this._imgMeta,
            ...result,
          };

        this._tooLarge = (result.height > this._config.maxImgPx
          || result.width > this._config.maxImgPx);

        if (force === false || typeof this._imgMeta.ogHeight !== 'number') {
          // Only set the original height & width the first time this
          // is called
          this._imgMeta.ogHeight = result.height;
          this._imgMeta.ogWidth = result.width;
        } else if (force === true && this._tooLarge === true) {
          this._ok = false;
        }

        this._dispatch('imageMetaSet', this._id);
      });
    }

    return false;
  }

  /**
   * Add another whatcher function
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
  addWatcher(dispatcher, id, replace = false) {
    if (this._comms !== null) {
      try {
        this._comms.addWatcher(dispatcher, id, replace);
      } catch (error) {
        // console.error(error.message);
        // throw Error(error.message);
      }
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
    return (this._comms !== null)
      ? this._comms.removeWatcher(id)
      : false;
  }

  resetImgSrc() {
    this._getImgSrc(this._file);
  }

  /**
   * Process image
   *
   * @param {ImageProcessor|null} imgProcessor
   *
   * @returns {boolean}
   */
  async process(imgProcessor = null) {
    if (this._isImage === true && imgProcessor !== null) {
      this._processing = true;

      await imgProcessor.process(this);

      if (this._ogSize !== this._file.size) {
        this._getImgSrc(this._file);
        this.setImageMetadata(true);
      }

      this._processing = false;

      return true;
    }

    return false;
  }

  //  END:  Public utility methods
  // ----------------------------------------------------------------
}

export default FileSelectDataFile;
