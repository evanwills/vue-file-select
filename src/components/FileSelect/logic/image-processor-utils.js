/**
 * Get an image object
 *
 * @param {File} file
 *
 * @returns {Promise<Image>}
 */
const getImage = (src) => new Promise(
  (resolve) => {
    const img = new Image();

    img.onload = () => {
      resolve(img);
    };
    img.src = src;
  },
);

/**
 * Get image height, width and format
 *
 * @param {File} file Image file
 *
 * @returns {Object<{format:string,height:number,width:number}}
 */
export const getImageMetadata = async (src) => {
  const img = await getImage(src);
  let format = 'square';

  if (img.height > img.width) {
    // portrait format
    format = 'portrait';
  } else if (img.height < img.width) {
    // landscape format
    format = 'landscape';
  }

  return {
    format,
    height: img.height,
    width: img.width,
  };
};

export const fileIsImage = (file) => file.type.startsWith('image/');

export const canResizeImg = (file) => (fileIsImage(file) && !file.type.startsWith('image/svg'));
