import { FileSelectCommunicator } from './FileSelectCommunicator.class';

export class FileSelectCommunicatorLogging extends FileSelectCommunicator {
  dispatch(type, data) {
    super.dispatch(type, data);

    this._log.push({ type, data });
  }
}

export default FileSelectCommunicatorLogging;
