// import { getValidJpegCompression, getValidMaxImgPx, getValidMaxSingleSize, overrideConfig } from "./file-select-utils";
import FileSelectFileData from "./FileSelectFileData.class";
import ImageProcessor from "./ImageProcessor.class";

export class IBRimageProcessor extends ImageProcessor {
  // ----------------------------------------------------------------
  // START: Define static properties

  static #processor = null;

  //  END:  Define static properties
  // ----------------------------------------------------------------
  // START: Define instance properties

  _config = null;

  //  END:  Define instance properties
  // ----------------------------------------------------------------
  // START: Static getter & setter methods

  //  END:  Static getter & setter methods
  // ----------------------------------------------------------------
  // START: Instance constructor

  constructor (canvas, config = null) {
    try {
      super(canvas, config);
    } catch (e) {
      throw Error(e.message);
    }
  }

  //  END:  Instance constructor
  // ----------------------------------------------------------------
  // START: Private methods

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
        IBRimageProcessor._noResize = true;
      }

      context._processOverSizedFile(file, true);
      context._finaliseProcessing(file, 1);
    }
  }

  _processInner (fileData, _resizeRatio) {
    fileData = super._processInner(fileData);
    if (IBRimageProcessor.#processor === null) {
      IBRimageProcessor.#processor = new imageBlobReduce();
    }

    return IBRimageProcessor._imgResize.toBlob(
      fileData,
      { max: this._config.maxImgPx },
    ).then(this.#processImageBlobThen(this, fileData))
      .catch(this.#processImageBlobCatch(this, fileData));
  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public methods

  forceInit () {
    if (IBRimageProcessor.#processor === null) {
      IBRimageProcessor.#processor = new imageBlobReduce();
    }
  }

  //  END:  Public methods
  // ----------------------------------------------------------------
}

export default IBRimageProcessor;
