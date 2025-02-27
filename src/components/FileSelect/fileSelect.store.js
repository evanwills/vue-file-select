import { defineStore } from "pinia";
import FileSelectDataFile from "./logic/FileSelectFileData.class";
import { computed } from "vue";

const defaultConfig = {
  maxFileCount: 15,
  maxImgPx: 1500,
  maxSingleSize: 15728640,
  maxTotalSize: 47185920,
  omitInvalid: true,
}

export const fileSelect = (customConfig = {}) => () => {
  // ================================================================
  // START: props

  const config = ref({ ...defaultConfig, ...customConfig });
  const fileList = ref([]);
  const totalSize = ref(0);
  const badIds = ref([]);
  const processingCount = ref(0);

  //  END:  props
  // ================================================================
  // START: computed values

  const badCount = computed(() => badIds.value.length);
  const fileCount = computed(() => fileList.value.length);
  const tooBig = computed(() => totalSize.value > config.value.maxTotalSize);
  const tooMany = computed(() => fileCount.value > config.value.maxFileCount)

  //  END:  computed values
  // ================================================================
  // START: helper functions

  const recalcTotal = () => {
    let sum = 0;

    for (const _file of fileList.value) {
      sum += _file.size;
    }

    totalSize.value = sum;
  };

  const removeBadId = (id) => {
    badIds.value = badIds.filter((_id) => _id !== id);
  };

  /**
   * Change the relative position of a file within the list of files
   * that the user has selected
   *
   * @param {string} name   Name of file to be moved.
   * @param {number} relPos Positive relative to its current position
   *                        in the list of files.
   *
   * @returns {boolean} TRUE if file was successfully moved.
   *                    FALSE otherwise.
   */
  const moveFile = (id, relPos) => {
    const max = fileList.value.length - 1;

    for (let a = 0; a < fileList.value.length; a += 1) {
      if (fileList.value[a].id === id) {
        const from = a;
        let to = a + relPos;

        if (to === a) {
          return false;
        } else if (to < a && to < 0) {
          if (a === 0) {
            return false;
          }
          to = 0;
        } else if (to > a && to > max) {
          if (a >= max) {
            return false;
          }
          to = max;
        }

        const item = fileList.value[from];
        fileList.value.splice(from, 1);
        fileList.value.splice(to, 0, item);

        fileList.value = fileList.value.map(resetPos);

        return true;
      }
    }

    return false;
  }

  //  END:  helper functions
  // ================================================================
  // START: setter functions

  /**
   *
   * @param {FileSelectDataFile} file
   */
  const addFile = (file) => {
    let done = false;

    if (omitInvalid && file.invalid === true) {
      return false;
    }

    for (let a = 0; a < fileCount; a += 1) {
      if (fileList.value[a].id === file.id) {
        fileList.value[a] = file;
        done = true;
        break;
      }
    }

    if (done === false) {
      fileList.value.push(file);
    }

    if (file.tooHeavy || file.ok === false || file.invalid) {
      if (badIds.value.includes(file.id) === false) {
        file.position = fileCount.value;
        badIds.value.push(file.id);
      }
    } else {
      removeBadId(file.id);
    }

    recalcTotal();

    return true;
  };

  const deleteFile = (id) => {
    fileList.value = fileList.value.filter((file) => file.id !== id);
    removeBadId(file.id);
    recalcTotal();
  };

  const incrementProcessing = () => {
    processingCount.value += 1;
  };

  const decrementProcessing = () => {
    processingCount.value -= 1;
  };

  const moveFileUp = (id) => {
    moveFile(id, -1);
  }

  const moveFileDown = (id) => {
    moveFile(id, 1);
  }

  const moveFileToStart = (id) => {
    moveFile(id, fileCount.value * -1);
  }

  const moveFileToEnd = (id) => {
    moveFile(id, fileCount.value);
  }

  const getGoodFiles = () => fileList.value.filter((file) => file.ok);

  //  END:  setter functions
  // ================================================================

  return {
    badCount,
    badIds,
    config,
    fileCount,
    fileList,
    processingCount,
    tooBig,
    tooMany,
    totalSize,
    addFile,
    decrementProcessing,
    deleteFile,
    getGoodFiles,
    incrementProcessing,
    moveFileDown,
    moveFileToEnd,
    moveFileToStart,
    moveFileUp,
    recalcTotal,
    removeBadId,
  }
};

export const initFileSelectStore = (id) => defineStore(id, fileSelect);

export default initFileSelectStore;
