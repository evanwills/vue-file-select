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

/**
 * Sanitise (and normalise) event name
 *
 * @param {string} input
 * @returns {string}
 */
export const sanitise = (input) => input.toLowerCase().replace(/[^a-z\d]+/ig, '');

/**
 * Sanitise (and normalise) event name
 *
 * @param {string} input
 * @returns {string}
 */
export const sanitiseID = (input) => input.replace(/[^a-z\d_-]+/ig, '');
