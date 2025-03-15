/**
 *
 * @param {string} input
 * @returns {string}
 */
export const brBr2p = (input) => {
  const tmp = ((input || '').match(/<br ?\/?>\s*<br ?\/?>/isg) || []).length;

  let output = input.replace(/(?<=<p>)\s*<span>(.*?)<\/span>\s*(?=<\/p>)/gis, '$1');

  for (let a = 0; a < tmp; a += 1) {
    output = output.replace(/(?<=<p>)([^<]+)(?:<br ?\/?>\s*<br ?\/?>\s*)/g, '$1</p><p>');
  }

  return output;
};

export const getProseOverrides = (input, overrides) => {
  let output = input;
  const _overrides = overrides.split(' ');

  for (const override of _overrides) {
    const tmp = override.trim();

    if (tmp !== '') {
      const old = tmp.replace(/^(prose-[a-z]+:[a-z]+-).*$/, '$1');
      const find = new RegExp(`${old}[^ ]+(?=\\s|$)`);

      output = output.replace(find, tmp);
    }
  }

  return output;
};

export const stripPinLi = (input) => {
  const regex = /(?:(<li(?: [^>]+)?>)\s*<p(?: [^>]+)?>|<\/p>\s*(<\/li>))/isg;

  return input.replace(regex, '$1$2');
};

export const strArrayToHumanStr = (input) => {
  if (!Array.isArray(input)) {
    throw new Error(
      'strArrayToHumanStr() expects only parameter to be an Array. '
      + `${typeof input} given`,
    );
  }

  return input.join(', ').replace(/,(?=[^,]+$)/i, ' &');
};
