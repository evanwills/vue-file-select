import { FileSelectCommunicator } from './FileSelectCommunicator.class';

export class FileSelectCommunicatorLogging extends FileSelectCommunicator {
  dispatch(type, data, src = null) {
    console.groupCollapsed(`Communicator.dispatch("${type}")`);

    if (typeof src === 'string') {
      console.log('SOURCE:', src);
    }

    console.log('type:', type);
    console.log('data:', data);

    super.dispatch(type, data);

    this._log.push({ type, data });

    console.groupEnd();
  }
}

export default FileSelectCommunicatorLogging;
