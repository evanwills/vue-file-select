
/**
 * Get an image object
 *
 * @param {File} file
 *
 * @returns {Promise<Image>}
 */
const getImage = (file) => new Promise(
  (resolve) => {
    const img = new Image();

    img.onload = () => {
      resolve(img);
    };

    img.src = URL.createObjectURL(file);
  },
);

/**
 * Get image height, width and format
 *
 * @param {File} file Image file
 *
 * @returns {Object<{format:string,height:number,width:number}}
 */
export const getImageMetadata = async (file) => {
  const img = await getImage(file);
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
}

export const fileIsImage = (file) => file.type.startsWith('image/');
