/**
 *
 * @param {string} input
 * @returns {Object<{ext:string, src:string}>}
 */
export const getLogBits = (input) => {
  let src = '';
  let ext = '';

  if (typeof input === 'string') {
    src = input.trim();

    if (src !== '') {
      ext = ` - ${src}`;
    }
  }

  return { ext, src };
};