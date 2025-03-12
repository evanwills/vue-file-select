import { isNonEmptyStr } from "../../../utils/data-utils";
import { getLogBits } from "./comms-utils";

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
  _actions = {};

  _log = [];

  _dispatcher = '';

  /**
   * Create a FileSelectCommunicator Object and add the root watcher
   *
   * @param {function} watcher Watcher function to be called when an
   *                           event is dispatched
   */
  constructor(logging = false) {
    this._dispatcher = (logging === true)
      ? '_loggingDispatcher'
      : '_simpleDispatcher';
  }

  _exists(event, id) {
    return (typeof this._actions[event] !== 'undefined'
      && typeof this._actions[event][id] === 'function');
  }

  _simpleDispatcher(event, data) {
    if (typeof this._actions[event] !== 'undefined') {
      for (const key of Object.keys(this._actions[event])) {
        this._actions[event][key](data);
      }
    }
  }

  _loggingDispatcher(event, data, _src) {
    const { ext, src } = getLogBits(_src);

    // eslint-disable-next-line no-console
    console.groupCollapsed(`Communicator.dispatch("${event}")${ext}`);

    if (src !== '') {
      console.log('SOURCE:', src); // eslint-disable-line no-console
    }

    console.log('event:', event); // eslint-disable-line no-console
    console.log('data:', data); // eslint-disable-line no-console

    this._simpleDispatcher(event, data);

    this._log.push({ event, data });

    console.groupEnd(); // eslint-disable-line no-console
  }

  /**
   * Add a new watcher function to the list of watcher functions that
   * are called each time an event is dispatched
   *
   * @function addWatcher
   *
   * @param {string}   event   Type of event that will trigger a call
   *                           to dispatch
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
  addWatcher(event, watcher, id, replace = false) {
    if (!isNonEmptyStr(event) || (typeof watcher !== 'function') || !isNonEmptyStr(id)) {
      throw new Error(
        'addWatcher() could not add new watcher because '
        + '`event` or `id` were empty strings or supplied '
        + '`watcher` was not a function.',
      );
    }

    if (this._exists(event, id) === true && replace !== true) {
      throw new Error(
        'addWatcher() could not add new '
        + `watcher because a watcher with the ID "${id}" `
        + 'already exists',
      );
    }

    if (typeof this._actions[event] === 'undefined') {
      this._actions[event] = {};
    }

    this._actions[event][id] = watcher;
  }

  /**
   * Remove a known watcher from the list of watchers
   *
   * @param {string}   event   Type of event that will trigger a call
   *                           to dispatch
   * @param {string}   id      ID of watcher so it can be removed or
   *                           replaced later
   *
   * @returns {boolean} TRUE if watcher was found and removed.
   *                    FALSE otherwise.
   */
  removeWatcher(event, id) {
    if (this._exists(event, id) === true) {
      const tmp = {};
      for (const key of Object.keys(this._actions[event])) {
        if (key !== id) {
          tmp[key] = this._actions[event][key];
        }
      }

      this._actions[event] = tmp;
      return true;
    }

    return false;
  }

  /**
   * Remove watchers from any event type that has a key matching
   * the ID supplied.
   *
   * @param {string} id
   *
   * @returns {number} the number of watchers that were actually
   *                   removed
   */
  removeWatchersById(id) {
    let output = 0;

    for (const event of Object.keys(this._actions)) {
      if (this.removeWatcher(event, id) === true) {
        output += 1;
      }
    }

    return output;
  }

  /**
   * Dispatch an event with some data
   *
   * @param {string}      event Type of event that triggered the
   *                            dispatch call
   * @param {any}         data  Data to dispatch along with event
   * @param {string|null} src   Source of the event
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
