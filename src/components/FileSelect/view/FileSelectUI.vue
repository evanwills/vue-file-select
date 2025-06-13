<template>
  <div>
    <FileSelectUiInput
      v-if="selectedFiles !== null"
      :accept-types="acceptTypes"
      :file-list="selectedFiles"
      :id="inputID"
      :label="label"
      :multi="multiple"
      small
      v-on:addfiles="handleFilesAdded" />
    <dialog
      class="file-select-ui-modal"
      ref="fileSelectUI">
      <div>
        <FileSelectUiPreview
          v-show="previewing === true && selectedFiles !== null"
          :accept-types="acceptTypes"
          :file-id="preveiwFileId"
          :file-list="selectedFiles"
          :id="previewID"
          v-on:use="closePreview" />
        <FileSelectUiList
          v-show="previewing === false"
          :accept-types="acceptTypes"
          :id="listID"
          :file-list="selectedFiles"
          :key="resetNow"
          :multi="multiple"
          :no-move="noMove"
          v-on:cancel="handleCancel"
          v-on:upload="handleUpload">
          <slot name="default"></slot>
          <slot name="error"></slot>
        </FileSelectUiList>
        <button
          class="file-select-ui__btn file-select-ui-modal__btn-close"
          type="button"
          v-on:click="handleCancel">Close</button>
      </div>

      <canvas ref="fileSelectCanvas" class="sr-only"></canvas>
    </dialog>
    <ModalDialogue
      v-if="confirmCancel === true"
      :body="confirmCancelMsg"
      confirm-danger
      confirm-txt="Stop upload"
      cancel-txt="Cancel"
      heading="Are you sure?"
      :open="showConfirm"
      v-on:submit="doConfirmCancel"
      v-on:cancel="handleCancelConfirm" />
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeMount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { doCloseModal, doShowModal } from '../../../utils/vue-utils';
import { FileSelectList } from '../logic/FileSelectList.class';
import { getAllowedTypes } from '../logic/file-select-utils';
import FileSelectUiList from './FileSelectUiList.vue';
import FileSelectUiInput from './FileSelectUiInput.vue';
import FileSelectUiPreview from './FileSelectUiPreview.vue';
import ModalDialogue from '../../ModalDialogue.vue';
import ConsoleLogger from '../../../utils/ConsoleLogger.class';

// ------------------------------------------------------------------
// START: Vue utils

const emit = defineEmits([
  /**
   * `confirm` events indicate that the user selected all the files
   * they wish to upload and is ready to continue with their
   * submission.
   *
   * @property {string} confirm
   */
  'confirm',
  /**
   * `cancel` events indicate that the user is not ready to upload
   * anything and has terminated their selection without choosing
   * any files.
   *
   * @property {string} cancel
   */
  'cancel',
]);

//  END:  Vue utils
// ------------------------------------------------------------------
// START: Props

const props = defineProps({
  /**
   * A space separated list of file types this component will accept
   *
   * @property {string} accept
   */
  accept: { type: String, required: false, default: 'JPG PNG DOCX PDF' },

  /**
   * Whether or not the user must confirm that they really do want to
   * cancel their upload
   *
   * @property {boolean} uploadFailed
   */
  confirmCancel: { type: Boolean, required: false, default: false },

  /**
   * Body text of confirm cancel dialogue.
   *
   * @property {string} confirmCancelMsg
   */
  confirmCancelMsg: { type: String, required: false, default: '' },

  /**
   * Whether or not to convert images to grey scale when
   * resizing/reducing them
   *
   * > __Note:__ Only the `wasm` based image processor can convert
   * >           from colour to grey scale so this attribute/property
   * >           will be ignored if it the image processor can't
   * >           support it.
   *
   * @property {boolean} greyScale
   */
  greyScale: { type: Boolean, required: false, default: false },

  /**
   * String to be used as the root for all IDs of components/elements
   * rendered within this component
   *
   * @property {string} id
   */
  id: { type: String, required: true },

  /**
   * JPEG compression level to use when saving modified files
   *
   * @property {number} jpegCompression A number between 0 & 1
   */
  jpegCompression: { type: Number, required: false, default: 0.85 },

  /**
   * Text to show in the upload button visible in the root of this
   * component
   *
   * @property {string} label
   */
  label: { type: String, required: false, default: 'Upload' },

  /**
   * Maximum number of files this component will collect
   *
   * @property {number} maxFileCount
   */
  maxFileCount: { type: Number, required: false, default: 15 },

  /**
   * Maximum number of pixels (either height or width) the user can
   * upload
   *
   * > __Note:__ If an image exceeds this limit, (and the browser
   * >           can do it), the image will be automatically resized
   * >           before it is uploaded.
   *
   * @property {string|number} maxTotalSize
   */
  maxImgPx: { type: String, required: false, default: '1500' },

  /**
   * Human readable representation of maximum file size for a single
   * file
   *
   * @property {string} maxTotalSize
   */
  maxSingleSize: { type: String, required: false, default: '15MB' },

  /**
   * Human readable representation of maximum total upload size this
   * component can collect
   *
   * @property {string} maxTotalSize
   */
  maxTotalSize: { type: String, required: false, default: '45MB' },

  /**
   * Whether or not files are prevented from being added to the list
   * of files because they are the wrong type or too large.
   *
   * @property {boolean} noInvalid
   */
  noInvalid: { type: Boolean, required: false, default: false },

  /**
   * Whether or not the user can move files with the list of files
   * they have selected
   *
   * @property {boolean} noMove
   */
  noMove: { type: Boolean, required: false, default: false },

  /**
   * Custom message to show if the browser can't/won't resize user
   * selected images.
   *
   * @property {string} noResizeWarning
   */
  noResizeWarning: { type: String, required: false, default: '' },

  /**
   * Whether or not to preview an image when only one image is
   * selected
   *
   * > __Note:__ If you have both `preview` and `previewAll` present
   * >           `previewAll` will override `preview`.
   *
   * @property {boolean} preview
   */
  preview: { type: Boolean, required: false, default: false },

  /**
   * Whether or not to preview all images multiple images are
   * selected
   *
   * > __Note:__ If you have both `previewAll` and `preview` present
   * >           `previewAll` will override `preview`.
   *
   * @property {boolean} previewAll
   */
  previewAll: { type: Boolean, required: false, default: false },

  /**
   * Whether or not the upload failed
   *
   * @property {boolean} uploadFailed
   */
  uploadFailed: { type: Boolean, required: false, default: false },

  /**
   * Whether or not to use a WASM image resizer
   *
   * @property {boolean} wasm
   */
  wasm: { type: Boolean, required: false, default: false },
});

//  END:  Props
// ------------------------------------------------------------------
// START: Local state

const previewing = ref(false);
const selectedFiles = ref(null);
const acceptTypes = ref('image/jpeg, image/png application/msdoc');
const fileSelectCanvas = ref(null);
const fileSelectUI = ref(null);
const noResize = ref(false);
const preveiwFileId = ref('');
const showConfirm = ref(false);
const resetNow = ref(0);
const init = ref(true);
const _cLog = ref(null);
const noMulti = ref(false);

//  END:  Local state
// ------------------------------------------------------------------
// START: Computed helpers

const getID = (tag) => `${tag}--${props.id}`;

//  END:  Computed helpers
// ------------------------------------------------------------------
// START: Computed state

const inputID = computed(() => getID('fileInput'));
const listID = computed(() => getID('fileList'));
const previewID = computed(() => getID('preview'));
const multiple = computed(() => (noMulti.value === false && props.maxFileCount > 1));

//  END:  Computed state
// ------------------------------------------------------------------
// START: Helper methods

const addedWatcher = (data) => {
  _cLog.value.before('addedWatcher', { refs: ['previewing', 'preveiwFileId'], local: { data } });
  previewing.value = (previewing.value === true && data.isImage === true);
  preveiwFileId.value = data.id;
  doShowModal(fileSelectUI.value);
  _cLog.value.after('addedWatcher', { refs: ['previewing', 'preveiwFileId'] });
};

const noResizeWatcher = (data) => {
  _cLog.value.before('noResizeWatcher', { refs: 'noResize', local: { data } });
  noResize.value = (data !== false);
  _cLog.value.after('noResizeWatcher', { refs: 'noResize' });
};

const notAddedWatcher = () => {
  _cLog.value.before('notAddedWatcher', { refs: 'previewing' });
  previewing.value = false;
  doShowModal(fileSelectUI.value);
  _cLog.value.after('notAddedWatcher', { refs: 'previewing' });
};

const toBeAddedWatcher = (data) => {
  _cLog.value.before('toBeAddedWatcher', { refs: 'previewing', local: { data } });
  previewing.value = (data === 1);
  _cLog.value.after('toBeAddedWatcher', { refs: 'previewing' });
};

const deleteAllWatcher = (now) => {
  _cLog.value.before('deleteAllWatcher', { refs: 'resetNow', local: { now } });
  resetNow.value = now;
  _cLog.value.after('deleteAllWatcher', { refs: 'resetNow' });
};

const initFiles = () => {
  selectedFiles.value = new FileSelectList(
    fileSelectCanvas.value,
    {
      allowedTypes: acceptTypes.value,
      greyScale: props.greyScale,
      jpegCompression: props.jpegCompression,
      logging: false,
      maxFileCount: props.maxFileCount,
      maxImgPx: props.maxImgPx,
      maxSingleSize: props.maxSingleSize,
      maxTotalSize: props.maxTotalSize,
      omitInvalid: props.noInvalid,
      messages: {
        noResize: 'This browser does not support image resizing. '
          + 'Please use a supported browser like Chrome or Firefox.',
        tooBigFile: 'File size exceeds allowable limit. '
          + 'Individual files must be less than [[MAX_SINGLE]] and [[MAX_TOTAL]] total '
          + 'for multiple files.',
        invalidType: 'We detected an invalid file type. '
          + 'Valid file types include, [[TYPE_LIST]]',
      },
    },
  );

  selectedFiles.value.addWatcher('added', props.id, addedWatcher);
  selectedFiles.value.addWatcher('deleteAll', props.id, deleteAllWatcher);
  selectedFiles.value.addWatcher('duplicate', props.id, notAddedWatcher);
  selectedFiles.value.addWatcher('noResize', props.id, noResizeWatcher);
  selectedFiles.value.addWatcher('notadded', props.id, notAddedWatcher);
  selectedFiles.value.addWatcher('toBeAdded', props.id, toBeAddedWatcher);
};

const retryInitFiles = (_initFiles, files, canvas) => () => {
  if (files.value === null) {
    if (canvas.value !== null) {
      _initFiles();
    } else {
      setTimeout(retryInitFiles(_initFiles, files, canvas), 100);
    }
  }
};

const doConfirmCancel = async () => {
  _cLog.value.before('doConfirmCancel', { refs: ['selectedFiles', 'showConfirm'] });
  selectedFiles.value.deleteAll();
  await nextTick();
  doCloseModal(fileSelectUI.value);
  emit('cancel');
  showConfirm.value = false;
  selectedFiles.value = null;
  await nextTick();
  initFiles();
  _cLog.value.after('doConfirmCancel', { refs: ['selectedFiles', 'showConfirm'] });
};

//  END:  Helper methods
// ------------------------------------------------------------------
// START: Event handler methods

const handleUpload = () => {
  _cLog.value.before('handleUpload', { refs: '*' });
  emit('confirm', selectedFiles.value);
  doCloseModal(fileSelectUI.value);
  _cLog.value.before('handleUpload', { refs: '*' });
};

const handleCancel = () => {
  _cLog.value.before('handleCancel', { props: 'confirmCancel', refs: 'showConfirm' });
  if (props.confirmCancel === true) {
    showConfirm.value = true;
  } else {
    doConfirmCancel();
  }
  _cLog.value.after('handleCancel', { refs: 'showConfirm' });
};

const handleCancelConfirm = () => {
  _cLog.value.before('handleCancelConfirm', { refs: 'showConfirm' });
  showConfirm.value = false;
  _cLog.value.after('handleCancelConfirm', { refs: 'showConfirm' });
};

const closePreview = () => {
  _cLog.value.before('closePreview', { refs: 'previewing' });
  previewing.value = false;
  _cLog.value.after('closePreview', { refs: 'previewing' });
};

const handleFilesAdded = (event) => {
  _cLog.value.only('handleFilesAdded', { local: { event } });
};

//  END:  Event handler methods
// ------------------------------------------------------------------
// START: Watcher methods

watch(() => props.uploadFailed, (newVal) => {
  if (newVal === true) {
    doShowModal(fileSelectUI.value);
  }
});

//  END:  Watcher methods
// ------------------------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() => {
  if (init.value === true) {
    init.value = false;
    acceptTypes.value = getAllowedTypes(props.accept);
    acceptTypes.value = acceptTypes.value.map((type) => type.mime).join(', ');
    if (_cLog.value === null) {
      _cLog.value = new ConsoleLogger(
        '<file-select-ui>',
        props.id,
        {
          props: { ...props },
          refs: {
            previewing,
            selectedFiles,
            acceptTypes,
            noResize,
            preveiwFileId,
            showConfirm,
            resetNow,
          },
        },
        false,
      );
    }
  }
});

onMounted(() => {
  retryInitFiles(initFiles, selectedFiles, fileSelectCanvas)();
});

//  END:  Lifecycle methods
// ------------------------------------------------------------------
</script>

<style>
.file-select-ui-modal {
  position: relative;
  border: 0.05rem solid #ccc;
  border-radius: 0.5rem;
}
.file-select-ui-modal > div {
  padding-top: 3rem;
  max-width: 33rem;
}
.file-select-ui__btn {
  border: 0.05rem solid #fff;
  display: inline-block;
  text-align: center;
  padding: 0.5rem 2rem;
  border-radius: 0.5rem;
}
.file-select-ui-modal__btn-close {
  position: absolute;
  top: 0;
  right: 0;
  height: 3rem;
  width: 3rem;
  text-indent: -100;
  padding: 0.5rem;
  color: transparent;
}
.file-select-ui-modal__btn-close::before {
  content: '\000D7';
  color: #fff;
  display: block;
  text-indent: 0;
  line-height: 1rem;
  font-size: 2rem;
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.file-select-ui__btn-list {
  display: flex;
  column-gap: 1rem;
  align-items: center;
  width: 100%;
}
.file-select-ui__btn-list label {
  flex-grow: 1;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

</style>
