import { isNonEmptyStr } from './data-utils';
import { getLogBits, sanitise, sanitiseID } from './comms-utils';

/**
 * ComponentCommunicator provides a way of passing data to another
 * part of an application that may be interested in something
 * changing.
 *
 * It behaves very similarly to how DOM event listeners work.
 * Like with DOM events, A component (or object) can add a watcher
 * for one or more event types. Then when events are dispatched
 * (via ComponentCommunicator), any watchers for those events are
 * called with the data that was dispatched with the event.
 */
export class ComponentCommunicator {
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
    const _event = sanitise(event);

    if (typeof this._actions[_event] !== 'undefined') {
      for (const key of Object.keys(this._actions[_event])) {
        this._actions[_event][key](data);
      }
    }
  }

  _loggingDispatcher(event, data, _src) {
    const { ext, src } = getLogBits(_src);
    const _event = sanitise(event);

    // eslint-disable-next-line no-console
    console.groupCollapsed(`Communicator.dispatch("${_event}")${ext}`);

    if (src !== '') {
      console.log('SOURCE:', src); // eslint-disable-line no-console
    }

    console.log('event:', _event); // eslint-disable-line no-console
    console.log('data:', data); // eslint-disable-line no-console

    if (typeof this._actions[_event] !== 'undefined') {
      for (const key of Object.keys(this._actions[_event])) {
        console.log(`handler for: "${key}"`); // eslint-disable-line no-console
        this._actions[_event][key](data);
      }
    }

    this._log.push({ _event, data });

    console.groupEnd(); // eslint-disable-line no-console
  }

  _addWatcherInner(event, id, watcher, replace = false) {
    const _event = sanitise(event);
    const _id = sanitiseID(id);

    if (this._exists(_event, _id) === true && replace !== true) {
      throw new Error(
        'addWatcher() could not add new '
        + `watcher because a watcher with the ID "${_id}" `
        + 'already exists',
      );
    }

    if (typeof this._actions[_event] === 'undefined') {
      this._actions[_event] = {};
    }

    this._actions[_event][_id] = watcher;
  }

  /**
   * Add a new watcher function to the list of watcher functions that
   * are called each time an event is dispatched
   *
   * @function addWatcher
   *
   * @param {string|string[]}   event   Type of event that will trigger a call
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
  addWatcher(event, id, watcher, replace = false) {
    if ((!isNonEmptyStr(event) && !Array.isArray(event))
      || !isNonEmptyStr(id) || (typeof watcher !== 'function')
    ) {
      throw new Error(
        'addWatcher() could not add new watcher because '
        + '`event` or `id` were empty strings or supplied '
        + '`watcher` was not a function.',
      );
    }

    if (Array.isArray(event)) {
      for (const ev of event) {
        this._addWatcherInner(ev, id, watcher, replace);
      }
    } else {
      this._addWatcherInner(event, id, watcher, replace);
    }
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
    const _event = sanitise(event);
    const _id = sanitiseID(id);

    if (this._exists(event, _id) === true) {
      const tmp = {};

      for (const key of Object.keys(this._actions[_event])) {
        if (key !== _id) {
          tmp[key] = this._actions[_event][key];
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
  removeWatchersByID(id) {
    let output = 0;
    const _id = sanitiseID(id);

    for (const event of Object.keys(this._actions)) {
      if (this.removeWatcher(event, _id) === true) {
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

export default ComponentCommunicator;
