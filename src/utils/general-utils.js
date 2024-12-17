/**
 * This file contains a collection of ("pure") utility functions for
 * performing common actions that are shared across components
 */

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
