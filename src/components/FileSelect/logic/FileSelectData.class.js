import { nanoid } from 'nanoid';
import {
  getAllowedTypes,
  getFileExtension,
  getUniqueFileName,
  getValidMaxSingleSize,
  imgIsTooLarge,
  isValidFileType,
  overrideConfig,
  rewriteConfigError,
  rewriteError,
} from './file-select-utils';
import { ComponentCommunicator } from '../../../ComponentCommunicator.class';
import { fileIsImage, getImageMetadata } from './image-processor-utils';
import { getImageSrc } from './file-select-File-utils';
import { isObj } from '../../../utils/data-utils';
import ConsoleLogger from '../../../../utils/ConsoleLogger.class';

export class FileSelectData {
  // ----------------------------------------------------------------
  // START: Define static properties

  static _defaultAllowed = [];

  static _maxSingleSize = 15728640;

  //  END:  Define static properties
  // ----------------------------------------------------------------
  // START: Define instance properties

  _cLog = null;

  _ext;

  _file;

  _force = true;

  _id = null;

  _imgMeta = null;

  _invalid = false;

  _isImage = false;

  _metaWaiting = false;

  _mime;

  _name;

  _newFile = false;

  _ogName;

  _ogSize;

  _ok = true;

  _position = -1;

  _previousName;

  _processing = false;

  _replaceCount = 0;

  _src = '';

  _tooLarge = false;

  _config;

  /**
   * @property {ImageProcessor|null}
   */
  _comms = null;

  //  END:  Define instance properties
  // ----------------------------------------------------------------
  // START: Constructor method

  constructor(file, config = null, comms = null, imgProcessor = null) {
    if (file instanceof File === false) {
      throw new Error(
        'FileSelectData constructor expects first parameter to '
        + `be a File object. ${typeof file} given`,
      );
    }

    this._comms = null;
    this._file = file;
    this._force = true;
    this._id = nanoid(8);
    this._imgProcessor = imgProcessor;
    this._invalid = false;
    this._metaWaiting = false;
    this._newFile = true;
    this._ok = true;
    this._position = -1;
    this._processing = false;
    this._replaceCount = 0;
    this._src = '';
    this._tooLarge = false;

    this._setConfig(config);

    if (comms !== null && comms instanceof ComponentCommunicator === true) {
      this._comms = comms;
    }

    this._setFileMeta(file, true);

    if (this._name !== this._ogName) {
      this._dispatch('renamed', this._id);
    }

    if (this._isImage) {
      this._initImage(file);
    }

    this._cLog = new ConsoleLogger('FileSelectData', this._id, { _this: this });
  }

  //  END:  Constructor methods
  // ----------------------------------------------------------------
  // START: Static getter & setter methods

  static getDefaultAllowed() { return this._defaultAllowed; }

  static getMaxSingleSize() { return this._maxSingleSize; }

  static setAllowedTypes(allowedTypes) {
    try {
      this._defaultAllowed = getAllowedTypes(allowedTypes);
    } catch (e) {
      console.error('something went wrong with allowed types');
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
  // START: Private method

  async _initImage() {
    if (this._newFile === true && this._imgProcessor !== null
      && this._isImage === true && this._ext !== 'svg'
      && this._processing === false
    ) {
      this._force = true;
      this._dispatch('imageProcessingStart', this._id);

      await this._setImageSrc();
      await this._setImageMeta();
      await this._processImage();
    }
  }

  async _setImageSrc() {
    if (this._isImage && this._ext !== 'svg') {
      try {
        this._src = await getImageSrc(this._file);
        this._dispatch('imageSrcSet', this._id);
      } catch (error) {
        throw Error(error);
      }
    }
  }

  _dispatch(type, data) {
    if (this._comms !== null) {
      this._comms.dispatch(type, data, 'FileSelectFileData');
    }
  }

  _setConfig(config) {
    // Preset config with default values

    this._config = {
      allowedTypes: FileSelectData._defaultAllowed,
      maxSingleSize: FileSelectData._maxSingleSize,
      maxImgPx: 1500,
    };

    try {
      this._config = overrideConfig(this._config, config);
    } catch (error) {
      throw Error(rewriteConfigError(error.message));
    }
  }

  _setOK() {
    if (isValidFileType(this._file, this._config.allowedTypes) === false) {
      this._invalid = true;
      this._ok = false;
    } else if (this.tooHeavy === true || this._tooLarge === true) {
      this._ok = false;
    } else {
      this._ok = true;
    }
  }

  _setFileMeta(file, setOg = false, replace = false) {
    const newName = getUniqueFileName(file.name, this._id);

    if (setOg === true) {
      this._ogName = file.name;
      this._ogSize = file.size;
    }

    this._previousName = (replace === true || typeof this._previousName !== 'string' || typeof this._name !== 'string')
      ? newName
      : this._name;

    this._name = newName;
    this._ext = getFileExtension(file);
    this._isImage = fileIsImage(file);
    this._mime = this._file.type;

    this._setOK();
  }

  /**
   * If a the file is new and is an image image
   *
   * @returns {Promise<boolean>}
   */
  async _processImage() {
    this._newFile = false;
    this._processing = true;

    const tmp = await this._imgProcessor.process(
      this._file,
      this.width,
      this.height,
    );

    if (tmp instanceof File) {
      this._file = tmp;

      this._setFileMeta(tmp);

      if (this._ogSize !== this._file.size) {
        this._dispatch('imageResized', this._id);
        await this._setImageSrc();
        await this._setImageMeta();
      }
    }

    this._processing = false;
    this._dispatch('imageProcessingEnd', this._id);

    return true;
  }

  _setImageMetaInner(result, force) {
    if (isObj(result)) {
      this._metaWaiting = false;

      this._imgMeta = (this._imgMeta === null)
        // set the image meta object from scratch
        ? { ...result }
        // merge the latest data into the image meata object
        : {
          ...this._imgMeta,
          ...result,
        };

      this._tooLarge = imgIsTooLarge(this._config, result.width, result.height);

      if (force === true || typeof this._imgMeta.ogHeight !== 'number') {
        // Only set the original height & width the first time this
        // is called
        this._imgMeta.ogHeight = result.height;
        this._imgMeta.ogWidth = result.width;
      }

      this._setOK();

      this._dispatch('imageMetaSet', this._id);
    }
  }

  async _setImageMeta() {
    if (this._isImage === true && this._metaWaiting === false) {
      this._metaWaiting = true;

      await this._setImageSrc();

      this._setImageMetaInner(await getImageMetadata(this._src), this._force);
      this._force = false;

      return true;
    }

    return false;
  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public getter & setter methods

  get allowedTypes() { return this._config.allowedTypes; }

  get ext() { return this._ext; }

  get file() { return this._file; }

  /**
   * @param {File} file
   */
  set file(file) {
    throw new Error(
      'FileSelectData does not allow file to be replaced manually. '
      + `Use \`replaceFile()\` method instead (#${this._id})`,
    );
  }

  get height() {
    return (typeof this._imgMeta?.height === 'number')
      ? this._imgMeta.height
      : 0;
  }

  get id() { return this._id; }

  get imgMeta() { return this._imgMeta; }

  get invalid() { return this._invalid; }

  get isImage() { return (this._isImage === true && this._invalid === false); }

  get lastModified() {
    return (typeof this._file.lastModified !== 'undefined')
      ? this._file.lastModified
      : -1;
  }

  get mime() { return this._mime; }

  /**
   * @param {string} mime
   */
  set mime(mime) {
    if (typeof mime === 'string') {
      this._mime = mime;
    }
  }

  get name() { return this._name; }

  /**
   * @param {string} name
   */
  set name(name) {
    if (typeof name === 'string') {
      const tmp = getUniqueFileName(name.trim(), this._id);
      if (tmp !== '') {
        this._previousName = this._name;
        this._name = tmp;
      }
    }
  }

  get ogHeight() {
    return (typeof this._imgMeta?.ogHeight === 'number')
      ? this._imgMeta.ogHeight
      : 0;
  }

  get ogName() { return this._ogName; }

  get ogWidth() {
    return (typeof this._imgMeta?.ogWidth === 'number')
      ? this._imgMeta.ogWidth
      : 0;
  }

  get ogSize() { return this._ogSize; }

  get ok() { return this._ok; }

  /**
   * @param {boolean} ok
   */
  set ok(ok) {
    if (typeof ok === 'boolean') {
      this._ok = ok;
    }
  }

  get position() { return this._position; }

  /**
   * @param {number} position
   */
  set position(position) {
    if (typeof position === 'number' && position >= 0) {
      this._position = position;
    }
  }

  get previousName() { return this._previousName; }

  get processing() { return this._processing; }

  set processing(processing) {
    if (typeof processing === 'boolean') {
      this._processing = processing;
    }
  }

  get replaceCount() { return this._replaceCount; }

  get size() { return this._file.size; }

  get src() { return this._src; }

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

  get tooLarge() { return this._tooLarge; }

  get width() {
    return (typeof this._imgMeta?.height === 'number')
      ? this._imgMeta.width
      : 0;
  }

  //  END:  Public getter & setter methods
  // ----------------------------------------------------------------
  // START: Public utility methods

  isMatch(id, name = '') {
    return (this._id === id || this._name === name);
  }

  isSame(fileData, checkSize = true) {
    const tmp = this.isMatch(fileData.id, fileData.name);
    if (tmp === false || checkSize === false) {
      return tmp;
    }

    return (fileData.ogSize === this._ogSize);
  }

  /**
   * Add another whatcher function
   *
   * @param {string|string[]} action  Action/event or list of
   *                                  actions/events the watcher is
   *                                  interested in
   * @param {string}          id      ID of the dispatcher (so it can
   *                                  be replaced or removed)
   * @param {Function}        watcher A function that can be used as
   *                                  an event handler
   * @param {boolean}         replace If a dispatcher already exists,
   *                                  replace it with the new
   *                                  dispatcher function
   *
   * @throws {Error} If dispatcher was not a function
   * @throws {Error} If id was not a string or was empty
   * @throws {Error} If a dispatcher with the same ID already exists
   *                 and `replace` is FALSE
   */
  addWatcher(action, id, watcher, replace = false) {
    if (this._comms !== null
      && (this._comms.watcherExists(action, id) === false || replace === true)
    ) {
      try {
        this._comms.addWatcher(action, id, watcher, replace);
      } catch (error) {
        console.error(error.message);
        // throw Error error message
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
  removeWatcher(action, id) {
    return (this._comms !== null)
      ? this._comms.removeWatcher(action, id)
      : false;
  }

  async resetImgSrc() {
    await this._setImageSrc(this._file);
    return this._src;
  }

  async replaceFile(file) {
    this._cLog.before('replaceFile', { local: { file }, _this: ['_file', '_newFile', '_replaceCount'] });
    if (file instanceof File === false) {
      throw new Error(
        'FileSelectFileData.replaceFile expects only argument to '
        + 'be a `File` object',
      );
    }

    if (file !== this._file) {
      this._newFile = true;
      this._file = file;
      this._replaceCount += 1;

      this._setFileMeta(file, true, true);

      this._initImage();

      this._dispatch('replaced', this._id);

      this._cLog.after('replaceFile', { _this: ['_file', '_newFile', '_replaceCount'] });

      return true;
    }

    this._cLog.after('replaceFile', { _this: ['_file', '_newFile', '_replaceCount'] });

    return false;
  }

  //  END:  Public utility methods
  // ----------------------------------------------------------------
}

export default FileSelectData;
