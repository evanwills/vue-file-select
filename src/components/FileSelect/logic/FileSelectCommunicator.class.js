
export class FileSelectCommunicator {
  _watchers = {};
  _log = [];

  constructor (dispatcher) {
    this.addWatcher(dispatcher, 'root');
  }

  _exists (id) {
    return typeof this._watchers[id] === 'function';
  }

  addWatcher (dispatcher, id, replace = false) {
    if ((typeof dispatcher !== 'function') || typeof id !== 'string' || id.trim() === '') {
      throw new Error(
        'addWatcher() could not add new dispatcher because '
        + 'supplied `dispatcher` was not a function or `id` was an '
        + 'empty string',
      );
    }

    if (this._exists(id) === true && replace !== true) {
      throw new Error(
        'addWatcher() could not add new '
        + `dispatcher because a dispatcher with the ID "${id}" `
        + 'already exists',
      );
    }

    this._watchers[id] = dispatcher;
  }

  removeWatcher (id) {
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

  dispatch (type, data, src = null) {
    console.groupCollapsed(`Communicator.dispatch("${type}")`);
    if (typeof src === 'string') {
      console.log('SOURCE:', src);
    }
    console.log('type:', type);
    console.log('data:', data);
    console.groupEnd();
    for (const key of Object.keys(this._watchers)) {
      this._watchers[key](type, data);
    }
  }

  getLogs () {
    return this._log;
  }

  clearLogs () {
    this._log = [];
  }
}

export class FileSelectLoggingCommunicator extends FileSelectCommunicator {
  dispatch (type, data) {
    super.dispatch(type, data);

    this._log.push({ type, data });
  }
}

export default FileSelectCommunicator;
