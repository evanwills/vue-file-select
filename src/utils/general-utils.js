/**
 * This file contains a collection of ("pure") utility functions for
 * performing common actions that are shared across components
 */

export const formatDate = (isoDate, shortMonth = false) => {
  const tmp = (typeof isoDate === 'string')
    ? new Date(isoDate)
    : isoDate;

  if ((tmp instanceof Date) === false || tmp.toString() === 'Invalid Date') {
    throw new Error('formatDate() could not convert input into a (valid) Date object');
  }

  const month = (shortMonth === true)
    ? 'short'
    : 'long';

  return tmp.toLocaleDateString(
    'en-AU',
    { day: 'numeric', month, year: 'numeric' },
  );
};

export const santisePhone = (input) => {
  if (typeof input !== 'string') {
    return null;
  }
  const phone = input.replace(/\D+/g, '');
  const pre = phone.substring(0, 2);

  const regex = (/0[45]|1\d/.test(pre))
    ? /(0[45]\d{2}|1\d00)(\d{3})(\d{3})/
    : /(0[1-36-9])(\d{4})(\d{4})/;

  return { phone, regex };
};

/**
 * Make an Australian phone number human readable
 *
 * e.g. mobile number: "0412345678" would be returned
 *      as: "0412 345 678"
 * e.g. fixed line number: "0298765432" would be returned
 *      as "02 9876 5432"
 *
 * @param {string} phone Phone number to be formatted
 *
 * @returns {string} Human readable Sustralian phone number
 */
export const formatPhone = (phone) => {
  const tmp = santisePhone(phone);

  if (tmp === null) {
    return '';
  }

  return tmp.phone.replace(tmp.regex, '$1 $2 $3');
};

const _phoneSupportLinkInner = (whole, pre, phone) => { // eslint-disable-line no-unused-vars
  const tmp = santisePhone(phone);

  if (tmp === null || tmp.phone.length !== 10) {
    return phone;
  }

  return `${pre}<a href="tel:+61${tmp.phone}">`
    + `${tmp.phone.replace(tmp.regex, '$1 $2 $3')}</a>`;
};

/**
 * Convert plain text phone numbers in Sitecore supplied content to
 * clickable phone number links
 *
 * @param {string} input Sitecore content that may contain a raw text
 *                       phone number
 *
 * @returns {string} Same string with phone nubmers converted to
 *                   `tel` links
 */
export const phoneNumberToLink = (input) => { // eslint-disable-line arrow-body-style
  const regex = /([a-z0-9] )([01]([- ]?\d){9})(?= [a-z0-9]+)/ig;

  return input.replace(regex, _phoneSupportLinkInner);
};

/**
 * Get a function that returns the start of an error message
 * (or console group name) string for a given method
 *
 * @param {string} componentName Name of the component `ePre()` is
 *                               being called from
 * @param {string} componentID   ID of component (if component is
 *                               used multiple times on a page)
 *
 * @returns {(method: string, before: boolean|null|string) : string}
 */
export const getEpre = (componentName, componentID = '') => {
  const tail = (componentID !== '')
    ? ` (#${componentID})`
    : '';

  return (method, before = null) => {
    const beforeT = typeof before;
    let suffix = '';

    if (beforeT === 'boolean') {
      suffix = (before === true)
        ? ' (before)'
        : ' (after)';
    } else if (beforeT === 'string') {
      const _before = before.trim();

      if (_before !== '') {
        suffix = ` ("${_before}")`;
      }
    }

    return `${componentName}.${method}()${tail}${suffix} `;
  };
};

export const isValidFileType = (file) => {
  const allwedTypes = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const tmpType = (typeof file?.type === 'string')
    ? file.type.trim()
    : '';

  return (tmpType !== '' && allwedTypes.indexOf(tmpType) > -1);
};

/**
 * Make name posessive (gramtically) by appending "'s" to names that
 * don't end in "S" and just and appostrophy to names already ending
 * in "s".
 *
 * @param {string} name Name to be made posessive
 *
 * @returns {string} Posessive form of name.
 */
export const makePossessive = (name) => {
  const _name = name.trim();
  const s = /s$/i.test(_name)
    ? ''
    : 's';

  return `${_name}'${s}`;
};

/**
 * Convert the supplied pixel to REMs based on a 16px rem
 *
 * @param {number} px
 *
 * @returns {number} REM equivalent of supplied pixel value rounded
 *                   to 2 decimal places
 */
export const px2rems = (px) => Math.round((px / 16) * 100) / 100;

/**
 * Make the first alphabetical character in a string upper case.
 *
 * @param {string} _whole whole regular expression match
 * @param {string} pre    preceeding non-alpha characters
 * @param {string} first  first alpha character
 *
 * @returns {string} with the first alphabetical character converted
 *                   to uppercase
 */
const ucFirstInner = (_whole, pre, first) => (pre + first.toUpperCase());

/**
 * Make the first alphabetical character in a string uppercase.
 *
 * @param {string} input String to be modified
 *
 * @returns {string} string with first alphabetical character
 *                   uppercased.
 */
export const ucFirst = (input) => input.trim().replace(/([^a-z]*)([a-z])/i, ucFirstInner);

/**
 * Convert string to different format string
 * e.g. human string to camelCase string or
 *      kebab case string to snake case
 *
 * @param {string} input    string to be modified
 * @param {string} splitter character to split string on
 *                          (empty if input is camelCase)
 * @param {string} joiner   character to use as string joiner
 *                          (if empty if output is camelCase)
 *
 * @returns {string} modified version of input string
 */
export const stringToOther = (input, splitter = ' ', joiner = '') => {
  let tmp = [];

  if (splitter === '') {
    // We are using match for splitting camel case because before
    // 2023-03-27 iOS Safari does not support lookbehind syntax and
    // throws an error
    tmp = input.match(/([A-Z]?[^A-Z]+)(?=[A-Z]|$)/g);
  } else {
    tmp = input.split(splitter);
  }

  tmp = tmp.map((item) => item.trim().toLowerCase());

  if (joiner === '') {
    for (let b = 1; b < tmp.length; b += 1) {
      tmp[b] = ucFirst(tmp[b]);
    }
  }

  return tmp.join(joiner);
};

/**
 * Convert a human readable string into a variable name format
 *
 * @param {string} input  String to be converted
 * @param {string} output Variable format.
 *                        Options are:
 *                        * `camel` [default] e.g. "myVarName"
 *                        * `snake` - e.g. "my_var_name"
 *                        * `SNAKE` - e.g. "MY_VAR_NAME"
 *                        * `kebab` - e.g. "my-var-name"
 *                        * `class` - e.g. "MyVarName"
 *                        * `dot` - e.g. "my.var.name"
 *
 * @returns {string}
 */
export const humanTo = (input, output = 'camel') => {
  switch (output) {
    case 'snake':
      return stringToOther(input, ' ', '_');
    case 'SNAKE':
      return stringToOther(input, ' ', '_').toUpperCase();
    case 'class':
      return ucFirst(stringToOther(input));
    case 'kebab':
      return stringToOther(input, ' ', '-');
    case 'dot':
      return stringToOther(input, ' ', '.');
    default:
      return stringToOther(input);
  }
};

/**
 * Get a human friendly list of offer recipient names
 *
 * @param {string[]} list List of names of users who are eligible
 *                        (or have accepted) this offer
 *
 * @return {string} human friendly list of offer recipient names
 */
export const humanReadableList = (listItems) => listItems.join(', ').replace(/, (?=[^,]+$)/s, ' & ');

/**
 * Add HTML zero width space character entity to email address to
 * make it wrap after the `@` symbol
 *
 * > __Note:__ If you do this, the string must be rendered from
 * >           within a v-html attribute, which allows any HTML.
 *
 * > __Note also:__ For security reasons this function also filters
 * >           out almost all non-alphanumeric characters
 *
 * > __Final note:__ The email address output by this function may be
 * >           invalid when copied and pasted into an email "To",
 * >           "CC" or "BCC" field
 *
 * @param {string} email Email address to make wrappable
 *
 * @returns {string} email address that will wrap when line gets
 *                   too long.
 */
export const wrappableEmail = (email, classes = '') => {
  const cls = (classes.trim() !== '')
    ? ` class="${classes}"`
    : '';

  return email.replace(/[^@a-z\d.\-_']+/, '').replace('@', `@<wbr${cls} />`);
};
/**
 * Find an element and set focus on it.
 *
 * > __Note:__ Depending on the component wrapping the input you're
 * >           focusing on, you may have to call `await nextTick();`
 * >           before you call `findAndFocus()` to ensure that any
 * >           re-rendering work that must be done is done and the
 * >           input/button is ready to receive focus.
 *
 * @param {string} selector CSS selector (often an ID) for input/
 *                          buttion to receive focus
 *
 * @returns {void}
 */
export const findAndFocus = async (selector) => {
  if (selector !== '') {
    let target = null;

    if (selector.startsWith('#') === true) {
      target = document.getElementById(selector.substring(1));
    } else {
      target = document.querySelector(selector);
    }

    if (target !== null) {
      target.focus();
    } else {
      console.error(`Could not find element matched by selector: "${selector}"`);
    }
  }
};

export const statusTypeIcon = (status, override = '') => {
  if (typeof override === 'string' && override.trim() !== '') {
    return override;
  }

  const _status = status.trim().toLowerCase();

  switch (_status) {
    case 'info':
    case 'error':
    case 'warning':
    case 'help':
      return _status;

    case 'success':
      return 'check_circle';

    default:
      return '';
  }
};

export const makeSafeAttr = (input) => {
  const t = typeof input;
  if (t !== 'string') {
    if (t === 'boolean') {
      return (input === true)
        ? 'true'
        : 'false';
    }

    return (t === 'number')
      ? input.toString()
      : '';
  }

  return input.toLocaleLowerCase().trim().replace(/[^a-z\d\-_]+/ig, '-').replace(/(?:^-|-$)/g, '');
};

export const isLocalDev = () => {
  if (typeof window === 'undefined' || window === null) {
    // we must be running in node or some other server
    // environment
    return true;
  }

  if (typeof window?.location?.host === 'string') {
    return (window.location.host.includes('localhost') || /:\d{2,5}$/.test(window.location.host));
  }
  if (typeof window.location === 'string') {
    // Is this URL is HTTP only
    // Does it have "localhost" in the host name
    // Does it have a port number in the host name
    // If so
    return (window.location.startsWith('http://')
      || /^https:\/\/[^/]*?localhost[^/]*?\//.test(window.location)
      || /^https:\/\/[^/]*?:\d{2,5}\//.test(window.location));
  }

  // If we're here, it probably (hopefully) means that I've checked
  // everything that's likely to indicate we're not in a local
  // environment.
  return true;
};
