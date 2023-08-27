import { unlink } from "fs/promises";

const removeFile = async (path) => {
  try {
    await unlink(path);
  } catch (error) {
    console.log("ошибка в удалении файла ogg");
  }
};

export default removeFile;
