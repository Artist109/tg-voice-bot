import { Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import c from "config";
import { ogg } from "./ogg.js";
import { openAIOur } from "./openAi.js";
import { OpenAIApi } from "openai";
import fs from "fs";

const bot = new Telegraf(c.get("TELEGRAM_TOKEN"));
const INITIAL_SESSION = {
  messages: [],
};

console.log(c.get("MODE"));

bot.use(session());

bot.command("new", async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply("Жду вашего голосового или текстового сообщения");
});

bot.command("start", async (ctx) => {
  ctx.session = INITIAL_SESSION;
  console.log(ctx.session);
  await ctx.reply(
    `Ваш запрос: "${text}" \nВремя обработки запроса: от 2 секунд до 1 минуты. `
  );
});

bot.on(message("voice"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;

  try {
    const userId = String(ctx.message.from.id);
    const fileLink = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const oggPath = await ogg.create(fileLink, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);

    const text = await openAIOur.transcription(mp3Path);

    await ctx.reply(
      `Ваш запрос: "${text}" \nВремя обработки запроса: от 2 секунд до 1 минуты. `
    );

    ctx.session.messages.push({
      role: openAIOur.roles.USER,
      content: text,
    });

    const resopnse = await openAIOur.chat(ctx.session.messages);
    ctx.session.messages.push({
      role: openAIOur.roles.ASSISTANT,
      content: resopnse.content,
    });

    await ctx.reply(resopnse.content);

    setTimeout(() => fs.rmSync(mp3Path), 1000); // удаляем голосовой файл
  } catch (e) {
    console.log("Ошибка в голосовой функции", e.message);
  }
});

bot.on(message("text"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;
  try {
    const text = ctx.message.text;
    // await ctx.reply(JSON.stringify(ctx.session, null, 2));
    await ctx.reply(
      `Ваш запрос: "${text}" \nВремя обработки запроса: от 2 секунд до 1 минуты. `
    );

    ctx.session.messages.push({
      role: openAIOur.roles.USER,
      content: text,
    });

    const response = await openAIOur.chat(ctx.session.messages);

    ctx.session.messages.push({
      role: openAIOur.roles.ASSISTANT,
      content: response.content,
    });

    await ctx.reply(response.content);
  } catch (e) {
    console.log("Ошибка в текстовой функции", e.message);
  }
});

bot.launch(
  process.once("SIGINT", () => bot.stop("SIGINT")),
  process.once("SIGTERM", () => bot.stop("SIGTERM"))
);
