import axios from "axios";
import { createWriteStream } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import Ffmpeg from "fluent-ffmpeg";
import installer from "@ffmpeg-installer/ffmpeg";
import removeFile from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

class OggConverter {
  constructor() {
    Ffmpeg.setFfmpegPath(installer.path);
  }

  toMp3(input, output) {
    try {
      const outputPath = resolve(dirname(input), `${output}.mp3`);
      return new Promise((res, rej) => {
        Ffmpeg(input)
          .inputOption("-t 30")
          .output(outputPath)
          .on("end", () => {
            removeFile(input);
            res(outputPath);
          })
          .on("error", (e) => rej(e.message))
          .run();
      });
    } catch (error) {
      console.log("ошибка в создании файла MP3", error.message);
    }
  }

  async create(url, fileName) {
    try {
      const oggPath = resolve(__dirname, "../voices", `${fileName}.ogg`);
      const response = await axios({
        method: "get",
        url,
        responseType: "stream",
      });
      return new Promise((resolve) => {
        const stream = createWriteStream(oggPath);
        response.data.pipe(stream);
        stream.on("finish", () => resolve(oggPath));
      });
    } catch (error) {
      console.log("ошибка в создании файла .ogg", error.message);
    }
  }
}

export const ogg = new OggConverter();
