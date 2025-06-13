/**
 * List of (optional) config override values that can be passed when
 * instantiating a new FileSelectList object
 *
 * @property {MimeType[]?} allowedTypes List of allowed file mime
 *                                  types
 * @property {boolean?} greyScale   Whether or not to convert images
 *                                  to greyscale when they are being
 *                                  resized (to further reduce the
 *                                  upload file size)
 *                                  [Default: TRUE]
 * @property {number?} jpegCompression JPEG compression value: A
 *                                  number between zero and one.
 *                                  [Default: 0.85]
 * @property {number?} maxFileCount The maximum number of files the
 *                                  user can upload at one time.
 *                                  [Default: 15]
 * @property {number?} maxImgPx     The maximum number of pixels (in
 *                                  either dimension) an image can be
 *                                  before it is automatically resized
 * @property {number?} maxTotalSize The maximum number of bytes
 *                                  allowed for combined file size of
 *                                  all selected files.
 *                                  [Default: 47,185,920 (45MB)]
 * @property {boolean?} omitInvalid  Whether or not invalid files
 *                                  should automatically be excluded
 *                                  from the upload list
 *                                  [Default: TRUE]
 * @property {FileSelectListErrorMessages?} messages List of error
 *                                  messages to show the user when
 *                                  something goes wrong
 *
 */
export type FileSelectListConfigParam = {
  /**
   * @property Whether or not to render comms logging messages to
   *           console
   */
  logging?: boolean,

  noResize?: boolean,
  /**
   * List of allowed file mime types
   *
   * NOTE: If `allowedTypes` is empty, any files may be selected
   *       If `allowedTypes` is NOT empty any files selected by the
   *       user that don't have a mime type matching one of the
   *       allowed types will be marked as invalid.
   *
   * @property
   */
  allowedTypes?: MimeType[],

  /**
   * Whether or not to convert images to greyscale when they are
   * being resized (to further reduce the upload file size)
   *
   * NOTE: `IBRimageProcessor` does not currently support greyscale
   *       conversion `PhotonImageProcessor` does. However,
   *       `PhotonImageProcessor` is not working for upload-button
   *       at the moment.
   *
   * @property
   */
  greyScale?: boolean,

  /**
   * JPEG compression value: A number between zero and one.
   *
   * Default value is 0.85
   *
   * @property
   */
  jpegCompression?: number,

  /**
   * The maximum number of files the user can upload at one time.
   *
   * Default value is 15
   *
   * @property
   */
  maxFileCount?: number,

  /**
   * The maximum number of pixels (in either dimension) an image can
   * be before it is automatically resized
   *
   * Default value is 1500
   *
   * @property
   */
  maxImgPx?: number,

  /**
   * The maximum number of bytes allowed for combined file size of
   * all selected files.
   *
   * Default value is 47,185,920 (45MB)
   *
   * @property
   */
  maxTotalSize?: number,

  /**
   * Whether or not invalid files should automatically be excluded
   * from the upload list
   *
   * Default value: TRUE
   *
   * @property
   */
  omitInvalid?: boolean,

  /**
   * List of error messages to show the user when something goes
   * wrong
   *
   * @property
   */
  messages?: {
    /**
     * Error messages to show when browser does not support image
     * resizing
     *
     * @property
     */
    noResize?: string,

    /**
     * Error messages to show when a single file is too large
     * (i.e. to many bytes) to be uploaded
     *
     * > __Note:__ `tooBigFile` has two placeholder strings:
     * > * `[[FILE_SIZE]]` which is replaced with the (human readable)
     * >   actual file size of the too big file
     * > * `[[MAX_SINGLE]]` which is replaced with the (human readable)
     * >   maximum size allowed for a single file.
     *
     * @property
     */
    tooBigFile?: string,

    /**
     * Error messages to show when the total upload size (i.e. total
     * number of bytes) is too large to be uploaded
     *
     * @property
     */
    tooBigTotal?: string,

    /**
     * Error messages to show when the total number of files is too
     * large to be uploaded
     *
     * @property
     */
    tooMany?: string,

    /**
     * Error message to show when an invalid file type has been
     * detected
     *
     * > __Note:__ `invalidType` has the placeholder `[[TYPE_LIST]]`
     * >           which is replaced by a list all the valid file
     * >           types the user can upload
     *
     * @property
     */
    invalidType?: string,
  },
};

/**
 * List of error messages to show the user when something goes
 * wrong
 *
 * @property {string} noResize    Error message to show when browser
 *                                does not support image resizing
 * @property {string} tooBigFile  Error messages to show when a
 *                                single file is too large
 *                                (i.e. to many bytes) to be uploaded
 * @property {string} tooBigTotal Error messages to show when the
 *                                total upload size (i.e. total number
 *                                of bytes) is too large to be
 *                                uploaded
 * @property {string} tooMany     Error messages to show when the
 *                                total number of files is too large
 *                                to be uploaded
 * @property {string} invalidType Error message to show when an
 *                                invalid file type has been detected
 */
export type FileSelectListErrorMessages = {
  /**
   * Error messages to show when browser does not support image
   * resizing
   *
   * @property
   */
  noResize: string,

  /**
   * Error messages to show when a single file is too large
   * (i.e. to many bytes) to be uploaded
   *
   * > __Note:__ `tooBigFile` has two placeholder strings:
   * > * `[[FILE_SIZE]]` which is replaced with the (human readable)
   * >   actual file size of the too big file
   * > * `[[MAX_SINGLE]]` which is replaced with the (human readable)
   * >   maximum size allowed for a single file.
   *
   * @property
   */
  tooBigFile: string,

  /**
   * Error messages to show when the total upload size (i.e. total
   * number of bytes) is too large to be uploaded
   *
   * @property
   */
  tooBigTotal: string,

  /**
   * Error messages to show when the total number of files is too
   * large to be uploaded
   *
   * @property
   */
  tooMany: string,

  /**
   * Error message to show when an invalid file type has been
   * detected
   *
   * > __Note:__ `invalidType` has the placeholder `[[TYPE_LIST]]`
   * >           which is replaced by a list all the valid file
   * >           types the user can upload
   *
   * @property
   */
  invalidType: string,
}

/**
 * Config settings for FileSelectList
 *
 * > __Note:__ Some properties are only here to pass on to client
 *             classes
 *
 * @property {MimeType[]} allowedTypes List of allowed file mime
 *                                  types
 * @property {boolean} greyScale    Whether or not to convert images
 *                                  to greyscale when they are being
 *                                  resized (to further reduce the
 *                                  upload file size)
 *                                  [Default: TRUE]
 * @property {number} jpegCompression JPEG compression value: A
 *                                  number between zero and one.
 *                                  [Default: 0.85]
 * @property {number} maxFileCount  The maximum number of files the
 *                                  user can upload at one time.
 *                                  [Default: 15]
 * @property {number} maxImgPx      The maximum number of pixels (in
 *                                  either dimension) an image can be
 *                                  before it is automatically resized
 * @property {number} maxTotalSize  The maximum number of bytes
 *                                  allowed for combined file size of
 *                                  all selected files.
 *                                  [Default: 47,185,920 (45MB)]
 * @property {boolean} omitInvalid  Whether or not invalid files
 *                                  should automatically be excluded
 *                                  from the upload list
 *                                  [Default: TRUE]
 * @property {FileSelectListErrorMessages} messages List of error
 *                                  messages to show the user when
 *                                  something goes wrong
 */
export type FileSelectListInternalConfig = {
  /**
   * List of allowed file mime types
   *
   * NOTE: If `allowedTypes` is empty, any files may be selected
   *       If `allowedTypes` is NOT empty any files selected by the
   *       user that don't have a mime type matching one of the
   *       allowed types will be marked as invalid.
   *
   * @property
   */
  allowedTypes: MimeType[],

  /**
   * Whether or not to convert images to greyscale when they are
   * being resized (to further reduce the upload file size)
   *
   * NOTE: `IBRimageProcessor` does not currently support greyscale
   *       conversion `PhotonImageProcessor` does. However,
   *       `PhotonImageProcessor` is not working for upload-button
   *       at the moment.
   *
   * @property
   */
  greyScale: boolean,

  /**
   * JPEG compression value: A number between zero and one.
   *
   * Default value is 0.85
   *
   * @property
   */
  jpegCompression: number,

  /**
   * The maximum number of files the user can upload at one time.
   *
   * Default value is 15
   *
   * @property
   */
  maxFileCount: number,

  /**
   * The maximum number of pixels (in either dimension) an image can
   * be before it is automatically resized
   *
   * Default value is 1500
   *
   * @property
   */
  maxImgPx: number,

  /**
   * The maximum number of bytes allowed for combined file size of
   * all selected files.
   *
   * Default value is 47,185,920 (45MB)
   *
   * @property
   */
  maxTotalSize: number,

  /**
   * Whether or not invalid files should automatically be excluded
   * from the upload list
   *
   * Default value: TRUE
   *
   * @property
   */
  omitInvalid: boolean,

  /**
   * List of error messages to show the user when something goes
   * wrong
   *
   * @property
   */
  messages: FileSelectListErrorMessages,
};

/**
 * Holds basic info about a single file, plus the `File` itself and
 * possibly image metadata, if the file is an image
 *
 * @property {string}  ext          File extention
 * @property {File}    fileData     File object that can be uploaded
 *                                  to the server
 * @property {boolean} invalid      Whether or not the file is a
 * @property {boolean} isImage      Whether or not the file is an
 *                                  image
 * @property {string}  lastModified ISO8601 Date time string for when
 *                                  the file was last modified
 * @property {Object|null} metadata Basic info for image files
 * @property {string}  mime         File mime type
 * @property {string}  name         Unique name for file
 * @property {string}  ogName       Original name of selected file
 * @property {boolean} ok           Whether or not there are issues
 *                                  with this file
 * @property {boolean} oversize     Whether or not the file exceeds
 *                                  the maximum file size allowed
 * @property {number}  position     Postion of the file within the
 *                                  list of files
 * @property {boolean} processing   Whether or not the file is
 *                                  currently being processed
 * @property {string}  size         File size in bytes

 */
export type FileDataItem = {
  /**
   * @property File extention
   */
  ext: string,

  /**
   * @property File object that can be uploaded to the server
   */
  fileData: File,

  /**
   * @property Whether or not the file is a
   */
  invalid: boolean,

  /**
   * @property Whether or not the file is an image
   */
  isImage: boolean,

  /**
   * @property ISO8601 Date time string for when the file was last
   *           modified
   */
  lastModified: string,

  /**
   * @property Basic info for image files
   */
  metadata: Object|null,

  /**
   * @property File mime type
   */
  mime: string,

  /**
   * @property Unique name for file
   */
  name: string,

  /**
   * @property Original name of selected file
   */
  ogName: string,

  /**
   * @property Whether or not there are issues with this file
   */
  ok: boolean,

  /**
   * @property Whether or not the file exceeds the maximum file size
   *           allowed
   */
  oversize: boolean,

  /**
   * @property Postion of the file within the list of files
   */
  position: number,

  /**
   * @property Whether or not the file is currently being processed
   */
  processing: boolean,

  /**
   * @property File size in bytes
   */
  size: string,
};

/**
 * `TRUE` if there are no more files yet to complete processing.
 * `FALSE` otherwise.
 *
 * The `allcompleted` event is dispatched every time processing a
 * single file is complete.
 *
 */
export type AllCompleteEventData = boolean;

/**
 * The `complete` event is dispatched every time processing a single
 * file is complete.
 *
 * @property {string} name Name of the file that has completed
 *                         processing
 * @property {number} pos  Position of the file within the list of
 *                         files the user has selected
 */
export type CompleteEventData = {
  /**
   * @property Name of the file that has completed processing
   */
  name: string,

  /**
   * @property Position of the file within the list of files the user
   *           has selected
   */
  pos: number,
};

/**
 * The name of single file being processed.
 *
 * The `invalid` event is dispatched when processing a file has
 * completed AND that is not one of the types allowed
 */
export type InvalidEventData = string;

/**
 * The `oversize` event is dispatched when a processing a file has
 * completed AND the file is larger than the maximum allowed for a
 * single file.
 *
 * @property {string} name Name of the file that has completed
 *                         processing
 * @property {number} size The file size (in bytes) for this file
 * @property {number} max  The mximum size (in bytes) allowed for a
 *                         single file
 */
export type OversizeEventData = {
  /**
   * @property Name of the file that has completed processing
   */
  name: string,

  /**
   * @property The file size (in bytes) for this file
   */
  size: number,

  /**
   * @property The mximum size (in bytes) allowed for a single file
   */
  max: number,
};

/**
 * The number of files about to be processed.
 *
 * The `processCount` event is dispatched when
 * `FileSelectData.processFiles` is called
 */
export type ProcesscountEventData = number;

/**
 * The name of single file being processed.
 *
 * The `processing` event is dispatched when
 * `FileSelectData.processSingleFile` is called
 */
export type ProcessingEventData = string;

/**
 * The `toobig` event is dispatched when a processing a file has
 * completed AND the total size (in bytes) maximum total size allowed
 *
 * @property {string} name Name of the file that has completed
 *                         processing
 * @property {number} size The total number of bytes for all the
 *                         files uploaded
 * @property {number} max  The maximum total number of bytes allowed
 */
export type ToobigEventData = {
  /**
   * @property Name of the file that has completed processing
   */
  name: string,

  /**
   * @property The total number of bytes for all the files uploaded
   */
  size: number,

  /**
   * @property The maximum total number of bytes allowed
   */
  max: number,
};

/**
 * The `toomany` event is dispatched when a processing a file has
 * completed AND the maximum number of files allowed has already
 * been reached.
 *
 * @property {string} name  Name of the file that has completed
 *                          processing
 * @property {number} count The number of files the user has selected
 * @property {number} max   Maximum number of files allowed
 */
export type ToomanyEventData = {
  /**
   * @property Name of the file that has completed processing
   */
  name: string,

  /**
   * @property The number of files the user has selected
   */
  count: number,

  /**
   * @property Maximum number of files allowed
   */
  max: number,
};

/**
 * A function that is called every time an event is dispatched and
 * does an action if the event is of a type it cares about.
 *
 * @param {string} evenName Name of the event being dispatched
 * @param {
 *    AllCompleteEventData|
 *    CompleteEventData|
 *    InvalidEventData|
 *    ProcesscountEventData|
 *    ProcessingEventData|
 *    ToobigEventData|
 *    ToomanyEventData
 * } data Data associated with the event
 *
 * @returns {any|void}
 */
export type Watcher = (
  evenName : string,
  data : AllCompleteEventData|
         CompleteEventData|
         InvalidEventData|
         ProcesscountEventData|
         ProcessingEventData|
         ToobigEventData|
         ToomanyEventData
) => any|void;

/**
 * @property {FileDataItem[]} fileList All the files held by
 *                                FileSelectData
 * @property {boolean[]} newFiles
 */
export type ProcessFilesReturn = {
  fileList: FileDataItem[],
  newFiles: boolean[],
};

/**
 *
 * @param {FileList} files List of files provided by
 *                         `<input type="file" />`
 *
 * @returns {void}

 */
export type FProcessFiles = (files : FileList) => void;

export type GenericFileType = 'audio'|'document'|'image'|'text'|'video';
/**
 * @property {string} ext  File extension expected for the file.
 * @property {string} mime Mime type string to match file by
 * @property {string} name Mime type string to match file by
 */
export type MimeType = {
  ext: string,
  mime: string,
  name: string,
  type: GenericFileType,
}

export type MimeTypeList = {
  [index:string]: MimeType,
}
