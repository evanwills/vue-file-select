import ImageBlobReduce from 'image-blob-reduce';

import { setLocalValue } from '../../../utils/data-utils';
import { ImageProcessor } from './ImageProcessor.class';

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

  constructor(canvas, config = null, comms = null) {
    try {
      super(canvas, config, comms);
    } catch (e) {
      throw Error(e.message);
    }
    this._obj = 'ImageBlobReduceProcessor';
    if (IBRimageProcessor._reducer === null) {
      IBRimageProcessor._reducer = new ImageBlobReduce();
    }
  }

  //  END:  Instance constructor
  // ----------------------------------------------------------------
  // START: Private methods

  /**
   * Get a callback function to pass to `ImageBlobReduce.toBlob().then()`
   * to handle successful resizing of an image
   *
   * @param {FileSelectData} fileData File data object currently being
   *                                  processed
   * @returns {Function<{Blob}}}
   */
  _processImageBlobThen(file, lastModified) {
    return (blob) => {
      this._dispatch('endImgProcessing', file);
      return new File(
        [blob],
        file.name,
        {
          type: blob.type,
          lastModified: file.lastModified,
        },
      );
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
  _processImageBlobCatch(file) {
    return (error) => {
      this._dispatch('resizeerror', error.message);

      if (error.message.includes('Pica: cannot use getImageData on canvas')) {
        IBRimageProcessor._noResize = true;
        setLocalValue('noResize', 1);
        this._dispatch('noResize', true);
      }
      file.processing = false; // eslint-disable-line no-param-reassign
      this._dispatch('endImgProcessing', file);
    };
  }

  async _processInner(file, _resizeRatio) { // eslint-disable-line no-unused-vars
    try {
      const blob = await IBRimageProcessor._reducer.toBlob(
        file,
        { max: this._config.maxImgPx },
      );

      this._dispatch('endImgProcessing', file);
      return new File(
        [blob],
        file.name,
        {
          type: blob.type,
          lastModified: file.lastModified,
        },
      );
    } catch (error) {
      this._dispatch('resizeerror', error.message);

      if (error.message.includes('Pica: cannot use getImageData on canvas')) {
        IBRimageProcessor._noResize = true;
        setLocalValue('noResize', 1);
        this._dispatch('noResize', true);
      }
      file.processing = false; // eslint-disable-line no-param-reassign
      this._dispatch('endImgProcessing', file);
    }

    // .then(this._processImageBlobThen(file.name, file.lastModified))
    //   .catch(this._processImageBlobCatch(file));
  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public methods

  forceInit() {
    super.forceInit();
  }

  //  END:  Public methods
  // ----------------------------------------------------------------
}

export default IBRimageProcessor;
