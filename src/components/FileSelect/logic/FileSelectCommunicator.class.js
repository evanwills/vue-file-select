
export class FileSelectCommunicator {
  _dispatchers = {};
  _log = [];

  constructor (dispatcher) {
    this.addDispatcher(dispatcher, 'root');
  }

  _exists (id) {
    return typeof this._dispatchers[id] === 'Function';
  }

  addDispatcher (dispatcher, id, replace) {
    if ((typeof dispatcher !== 'function') || typeof id !== 'string' || id.trim() === '') {
      throw new Error(
        'addDispatcher() could not add new dispatcher because '
        + 'supplied dispatcher was not a function or id was not '
        + 'a non-empty string',
      );
    }

    if (this._exists(id) === true && replace === false) {
      throw new Error(
        'addDispatcher() could not add new '
        + `dispatcher because a dispatcher with the ID "${id}" `
        + 'already exists',
      );
    }

    this._dispatchers[id] = dispatcher;
  }

  removeDipatcher (id) {
    if (this._exists(id) === true) {
      const tmp = {};
      for (const key of Object.keys(this._dispatchers)) {
        if (key !== id) {
          tmp[key] = this._dispatchers[key];
        }
      }

      this._dispatchers = tmp;
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
    for (const key of Object.keys(this._dispatchers)) {
      this._dispatchers[key](type, data);
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
