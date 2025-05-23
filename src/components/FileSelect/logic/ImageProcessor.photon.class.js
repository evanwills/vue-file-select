import { ImageProcessor } from './ImageProcessor.class';

const photonURL = 'http://localhost:3917/wasm/photon_rs_bg.wasm';

export class PhotonImageProcessor extends ImageProcessor {
  // ----------------------------------------------------------------
  // START: Define static properties

  static #processor = null;

  //  END:  Define static properties
  // ----------------------------------------------------------------
  // START: Define instance properties

  _obj = 'PhotonImageProcessor';

  //  END:  Define instance properties
  // ----------------------------------------------------------------
  // START: Static getter & setter methods

  //  END:  Static getter & setter methods
  // ----------------------------------------------------------------
  // START: Instance constructor

  constructor(canvas, config = null, comms = null) {
    super(canvas, config, comms);
    this._obj = 'PhotonImageProcessor';
  }

  //  END:  Instance constructor
  // ----------------------------------------------------------------
  // START: Private methods

  /**
   *
   * @param {FileSelectFileData} fileData
   * @param {number}             resizeRatio
   */
  async _processImg(fileData, resizeRatio) {
    // See documentation:
    // https://silvia-odwyer.github.io/photon/guide/using-photon-web/

    this._dispatch('startprocessing', fileData);
    const ctx = this.canvas.getContext('2d');

    // Draw the image element onto the canvas
    ctx.drawImage(fileData.file, 0, 0);

    // Convert the ImageData found in the canvas to a PhotonImage
    // (so that it can communicate with the core Rust library)
    const image = PhotonImageProcessor.#processor.open_image(this.canvas, ctx);

    PhotonImageProcessor.#processor.reisze(
      image,
      fileData.width * resizeRatio,
      fileData.height * resizeRatio,
    );

    if (this._config.greyScale === true) {
      PhotonImageProcessor.#processor.greyScale(image);
    }

    // Place the modified image back on the canvas
    PhotonImageProcessor.#processor.putImageData(
      this._canvas,
      ctx,
      image,
    );

    // eslint-disable-next-line no-param-reassign
    fileData.file = await this._getProcessedImageFile(fileData.file, this._canvas);
    // eslint-disable-next-line no-param-reassign
    fileData.size = file.size;
    // eslint-disable-next-line no-param-reassign
    fileData.ok = (file.size < this._config.maxSingleSize);
    fileData.setImageMetadata(true);
    this._dispatch('endprocessing', fileData);
  }

  static _setPhoton(photon) {
    this.#processor = photon;
  }

  _initPhoton(file, resizeRatio) {
    const setPhoton = PhotonImageProcessor._setPhoton;
    const proccessImg = this._processImg;

    return (photon) => {
      setPhoton(photon);
      proccessImg(file, resizeRatio);
    };
  }

  async _getProcessedImageFile({ uniqueName, lastModified }, canvas) {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(
            new File(
              [blob],
              uniqueName.replace(/(?<=\.)[a-z0-9]+$/, 'jpg'),
              {
                lastModifiedDate: lastModified,
                type: 'image/jpeg',
              },
            ),
          );
        },
        'image/jpeg',
        this._config.jpegCompression,
      );
    });
  }

  async _processInner(fileData, resizeRatio) {
    if (PhotonImageProcessor.#processor === null) {
      import('@silvia-odwyer/photon').then(this._initPhoton(fileData, resizeRatio));
    } else {
      this._processImg(fileData, resizeRatio);
    }
  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public methods

  forceInit() {
    if (PhotonImageProcessor.#processor === null) {
      import('@silvia-odwyer/photon').then(
        PhotonImageProcessor._setPhoton,
      );
    }
  }

  //  END:  Public methods
  // ----------------------------------------------------------------
}

export default PhotonImageProcessor;
