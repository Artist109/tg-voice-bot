import { Configuration, OpenAIApi } from "openai";
import c from "config";
import { createReadStream } from "fs";

class OpenAIOur {
  roles = {
    ASSISTANT: "assistant",
    USER: "user",
    SYSTEM: "system",
  };

  constructor(apiKey) {
    const configuration = new Configuration({ apiKey });
    this.openai = new OpenAIApi(configuration);
  }

  async chat(messages) {
    try {
      const response = this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
      });
      return (await response).data.choices[0].message;
    } catch (error) {
      console.log("ошибка в ответе от GPT", error.message);
    }
  }

  async transcription(filePath) {
    try {
      const resopnse = await this.openai.createTranscription(
        createReadStream(filePath),
        "whisper-1"
      );
      return resopnse.data.text;
    } catch (error) {
      console.log("ошибка в переводе в текст", error.message);
    }
  }
}

export const openAIOur = new OpenAIOur(c.get("OPENAI_KEY"));
