import { getValidJpegCompression, getValidMaxImgPx, overrideConfig } from "./file-select-utils";
import FileSelectDataFile from "./fileSelectDataFile.class";

export class ImageResize {
  static #greyScale = false;
  static #jpegCompression = 0.85;
  static #maxImgPx = 1500;
  static #noResize = false;

  #canvas = null;
  #_greyScale = false;
  #_jpegCompression = 0.85;
  #_maxImgPx = 1500;

  constructor (canvas, maxImgPx = null, jpegCompression = null, greyScale = false) {
    this.#canvas = canvas;

    this.#_greyScale = (typeof greyScale === 'boolean')
      ? (greyScale === true)
      : ImageResize.#greyScale;

    this.#_jpegCompression = (jpegCompression !== null)
      ? getValidJpegCompression(jpegCompression)
      : ImageResize.#jpegCompression;

    this.#_maxImgPx = (maxImgPx !== null)
      ? getValidMaxImgPx(maxImgPx)
      : ImageResize.#maxImgPx;;
  }

  _getImage (file) {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload(() => { resolve(img) });

      img.src = file;
    })
  }

  async _setAspectRatio (fileData) {
    const img = await this._getImage(fileData.file);
    let aspectRatio = 0;

    if (img.height > img.width) {
      // portrait format
      aspectRatio = 1;
    } else if (img.height < img.width) {
      // landscape format
      aspectRatio = -1;
    }

    let ratio = 0;

    if (isPortrait === true) {
      if (img.height > this._config.maxImgPx) {
        ratio = this._config.maxImgPx / img.height;
      }
    } else {
      if (img.width > this._config.maxImgPx) {
        ratio = this._config.maxImgPx / img.width;
      }
    }

    fileData.height = img.height * ratio;
    fileData.ogHeight = img.height;
    fileData.width = img.width * ratio;
    fileData.ogWidth = img.width;

    return fileData;
  }

  /**
   *
   * @param {FileSelectDataFile} fileData
   *
   * @returns {FileSelectDataFile}
   */
  process (fileData) {
    return this._format === 1;
  }
}
