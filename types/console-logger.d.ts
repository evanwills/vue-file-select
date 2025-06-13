
/**
 * List of object property names or the name of a single property
 *
 * __Notes:__
 * * __Exclusion list:__
 *   If the value is an array and the first string in that array is
 *   prefixed with "`!`" list will be assumed to be an exclusion list
 *   so only properties *NOT* listed in the keys will be logged
 *
 * * __Wild card list:__
 *   If value is the string "`*`", all properties for that object will
 *   be logged
 *
 * * __Invalid keys:__
 *   * If value is not an array *or* a simple string *or* simple
 *     string is empty, it will be converted to an empty array.
 *   * If value is an array, any item in the array that is not a
 *     string or is an empty string, it will be filtered out.
 *   * If any string in the array does not match a known object key,
 *     it will be filtered out.
 */
export type TKeys = string[]|string;

/**
 * An object to pass to one of the ConsoleLogger methods to list what
 * values should be logged to console
 *
 * @property {TKeys?} props  List of names of component `props` to be
 *                           logged to console
 *                           (See TKeys type for more info)
 * @property {TKeys?} refs   List of names of component `ref`
 *                           variables to be logged to console
 *                           (See TKeys type for more info)
 * @property {TKeys?} _this  List of names of class properties to be
 *                           logged to console
 *                           (See TKeys type for more info)
 * @property {object?} local Object containing any local variables to
 *                           be logged to console
 *                           __Note:__ if `local` is not an object,
 *                           it will be ignored
 * @property {string} log    Message to conole.log()
 * @property {string} info   Message to console.info()
 * @property {string} warn   Message to console.warn()
 */
export type TLoggableVars = {
  /**
   * List of names of component props to be logged
   *
   * (See TKeys type for more info)
   *
   * @property
   */
  props?: TKeys,

  /**
   * List of names of component `ref` variables to be logged
   *
   * (See TKeys type for more info)
   *
   * @property
   */
  refs?: TKeys,

  /**
   * List of names of class properties to be logged to console
   *
   * (See TKeys type for more info)
   *
   * @property
   */
  _this?: TKeys,

  /**
   *  Object containing any local variables to be logged to console
   *
   * __Note:__ if `local` is not an object, it will be ignored
   *
   * @property
   */
  local?: object,

  /**
   * @property Message to output via conole.log()
   */
  log: string,

  /**
   * @property Message to output via conole.info()
   */
  info: string,

  /**
   * @property Message to output via conole.warn()
   */
  warn: string,
}
