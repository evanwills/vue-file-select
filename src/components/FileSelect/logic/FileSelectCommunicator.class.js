/**
 * FileSelectCommunicator provides a way of passing data to another
 * part of an application that may be interested in something
 * changing.
 *
 * It behaves vaguely similarly to how DOM event listeners work, in
 * that something can add a watcher. Then whenever any event is fired
 * the watcher is called. The watcher can then do something if the
 * event being fired is relevant to it.
 *
 * In retrospect, I think this is not an ideal pattern. Really this
 * should be rearchitected so that it behaves exactly like DOM events
 * where where a client listens for individual events. Then, when an
 * event is fired only the listeners for that event are called.
 */
export class FileSelectCommunicator {
  _watchers = {};

  _log = [];

  _dispatcher = '';

  /**
   * Create a FileSelectCommunicator Object and add the root watcher
   *
   * @param {function} watcher Watcher function to be called when an
   *                           event is dispatched
   */
  constructor(watcher, logging = false) {
    this.addWatcher(watcher, 'root');

    this._dispatcher = (logging === true)
      ? '_loggingDispatcher'
      : '_simpleDispatcher';
  }

  _exists(id) {
    return (typeof this._watchers[id] === 'function');
  }

  _simpleDispatcher(type, data) {
    for (const key of Object.keys(this._watchers)) {
      this._watchers[key](type, data);
    }
  }

  _loggingDispatcher(type, data, src) {
    let _src = '';
    let _tmp = '';

    if (typeof src === 'string') {
      _src = src.trim();

      if (_src !== '') {
        _tmp = ` - ${_src}`;
      }
    }

    console.groupCollapsed(`Communicator.dispatch("${type}")${_tmp}`);

    if (_src !== '') {
      console.log('SOURCE:', _src);
    }

    console.log('type:', type);
    console.log('data:', data);

    this._simpleDispatcher(type, data);

    this._log.push({ type, data });

    console.groupEnd();
  }

  /**
   * Add a new watcher function to the list of watcher functions that
   * are called each time an event is dispatched
   *
   * @function addWatcher
   *
   * @param {function} watcher Watcher function to be called when an
   *                           event is dispatched
   * @param {string}   id      ID of watcher so it can be removed or
   *                           replaced later
   * @param {boolean}  replace Whether or not to replace existing
   *                           watcher (matched by `id`) with
   *                           supplied watcher
   *
   * @returns {void}
   * @throws {Error} If :
   *                 * `watcher` is not a function
   *                   OR
   *                 * `id` is not a string
   *                   OR
   *                 * `id` is an empty string
   *                   OR
   *                 * `watcher` is matched by `id` but `replace`
   *                   is FALSE
   */
  addWatcher(watcher, id, replace = false) {
    if ((typeof watcher !== 'function') || typeof id !== 'string' || id.trim() === '') {
      throw new Error(
        'addWatcher() could not add new watcher because '
        + 'supplied `watcher` was not a function or `id` was an '
        + 'empty string',
      );
    }

    if (this._exists(id) === true && replace !== true) {
      throw new Error(
        'addWatcher() could not add new '
        + `watcher because a watcher with the ID "${id}" `
        + 'already exists',
      );
    }

    this._watchers[id] = watcher;
  }

  /**
   * Remove a known watcher from the list of watchers
   *
   * @param {string}   id      ID of watcher so it can be removed or
   *                           replaced later
   *
   * @returns {boolean} TRUE if watcher was found and removed.
   *                    FALSE otherwise.
   */
  removeWatcher(id) {
    if (this._exists(id) === true) {
      const tmp = {};
      for (const key of Object.keys(this._watchers)) {
        if (key !== id) {
          tmp[key] = this._watchers[key];
        }
      }

      this._watchers = tmp;
      return true;
    }

    return false;
  }

  /**
   * Dispatch an event with some data
   *
   * @param {string}      type Type/Name of event being dispatched
   * @param {any}         data Data to dispatch along with event
   * @param {string|null} src  Source of the event
   *                           (used by FileSelectCommunicatorLogging)
   */
  dispatch(type, data, src = null) { // eslint-disable-line no-unused-vars
    this[this._dispatcher](type, data, src);
  }

  getLogs() {
    return this._log;
  }

  clearLogs() {
    this._log = [];
  }
}

export default FileSelectCommunicator;
