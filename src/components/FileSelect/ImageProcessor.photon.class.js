import { getValidJpegCompression, getValidMaxImgPx, getValidMaxSingleSize, overrideConfig } from "./file-select-utils";
import FileSelectDataFile from "./fileSelectDataFile.class";

export class PhotonImageProcessor {
  // ----------------------------------------------------------------
  // START: Define static properties

  static #processor = null;

  //  END:  Define static properties
  // ----------------------------------------------------------------
  // START: Define instance properties

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

  async #processImg(fileData) {
    // See documentation:
    // https://silvia-odwyer.github.io/photon/guide/using-photon-web/

    const ctx = canvas.getContext('2d');

    // Draw the image element onto the canvas
    ctx.drawImage(fileData.file, 0, 0);

    // Convert the ImageData found in the canvas to a PhotonImage (so that it can communicate with the core Rust library)
    let image = PhotonImageProcessor.#processor.open_image(canvas, ctx);

    PhotonImageProcessor.#processor.reisze(
      image,
      fileData.width,
      fileData.height,
    );

    if (this._config.greyScale === true) {
      PhotonImageProcessor.#processor.greyscale(image);
    }

    // Place the modified image back on the canvas
    PhotonImageProcessor.#processor.putImageData(
      this._canvas,
      ctx,
      image,
    );

    file.file = await this.#getProcessedImageFile(file, this._canvas);
    file.size = file.file.size;
    file.ok = (file.size < this._config.maxSingleSize);

    // const newName = fileData.name !== fileData.file.name
    //   ? fileData.file.name
    //   : null;
  }

  static #setPhoton (photon) {
    this.#processor = photon;
  }

  #initPhoton (file) {
    const setPhoton = PhotonImageProcessor.#setPhoton;
    const proccessImg = this.#processImg;

    return (photon) => {
      setPhoton(photon);
      proccessImg(file);
    };
  }

  async #getProcessedImageFile ({ uniqueName, lastModified }, canvas) {
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

  _processInner (fileData) {
    fileData = super(fileData);
    if (ImageProcessor.#processor === null) {
      import("@silvia-odwyer/photon").then(this.#initPhoton(fileData));
    } else {
      this.#processImg(fileData);
    }
  }

  //  END:  Private methods
  // ----------------------------------------------------------------
  // START: Public methods

  forceInit () {
    if (ImageProcessor.#processor === null) {
      import("@silvia-odwyer/photon").then(
        PhotonImageProcessor.#setPhoton,
      );
    }
  }

  /**
   *
   *
   * @param {FileSelectDataFile} fileData
   *
   * @returns {FileSelectDataFile}
   */
  async process (fileData) {
    try {
      return super(fileData);
    } catch (error) {
      throw Error(error.message);
    }
  }

  //  END:  Public methods
  // ----------------------------------------------------------------
}

export default ImageProcessor;
