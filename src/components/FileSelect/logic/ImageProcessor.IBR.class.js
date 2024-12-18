// import { getValidJpegCompression, getValidMaxImgPx, getValidMaxSingleSize, overrideConfig } from "./file-select-utils";
import FileSelectFileData from "./FileSelectFileData.class";
import ImageProcessor from "./ImageProcessor.class";
import imageBlobReduce from "image-blob-reduce";

export class IBRimageProcessor extends ImageProcessor {
  // ----------------------------------------------------------------
  // START: Define static properties

  static _reducer = null;

  //  END:  Define static properties
  // ----------------------------------------------------------------
  // START: Define instance properties

  _obj = 'ImageBlobReduceProcessor';

  //  END:  Define instance properties
  // ----------------------------------------------------------------
  // START: Static getter & setter methods

  //  END:  Static getter & setter methods
  // ----------------------------------------------------------------
  // START: Instance constructor

  constructor (canvas, config = null, comms = null) {
    try {
      super(canvas, config, comms);
    } catch (e) {
      throw Error(e.message);
    }
    this._obj = 'ImageBlobReduceProcessor';
    if (IBRimageProcessor._reducer === null) {
      IBRimageProcessor._reducer = new imageBlobReduce();
    }
  }

  //  END:  Instance constructor
  // ----------------------------------------------------------------
  // START: Private methods

  /**
   * Get a callback function to pass to `ImageBlobReduce.toBlob().then()`
   * to handle successful resizing of an image
   *
   * @param {FileSelectDataFile} fileData File data object currently being
   *                                  processed
   * @returns {Function<{Blob}}}
   */
  _processImageBlobThen (fileData) {
    return (blob) => {
      const tmp = new File(
        [blob],
        fileData.name,
        {
          type: blob.type,
          lastModified: fileData.lastModified(),
        }
      );

      // sometimes the resized image ends up being larger than the
      // original because the original was better optimised.
      // Only replace the image if the new one is smaller that the
      // old one.
      if (tmp.size < fileData.size()) {
        fileData.file = tmp
        fileData.setImageMetadata(true);
      }

      fileData.processing = false;

      this._dispatch('endImgProcessing', fileData);
      return fileData;
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
  _processImageBlobCatch (file) {
    return (error) => {
      this._dispatch('resizeerror', error.message);

      if (error.message.includes('Pica: cannot use getImageData on canvas')) {
        IBRimageProcessor._noResize = true;
      }
      file.processing = false;
      this._dispatch('endImgProcessing', file);
    }
  }

  async _processInner (fileData, _resizeRatio) {
    this._dispatch('startprocessing', fileData);
    fileData.processing = true;
    return IBRimageProcessor._reducer.toBlob(
      fileData.file,
      { max: this._config.maxImgPx },
    ).then(this._processImageBlobThen(fileData))
      .catch(this._processImageBlobCatch(fileData));
  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public methods

  forceInit () {
  }

  //  END:  Public methods
  // ----------------------------------------------------------------
}

export default IBRimageProcessor;
