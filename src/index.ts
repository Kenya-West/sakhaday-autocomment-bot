/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as dotenv from "dotenv";
import { Telegraf } from "telegraf";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const port = process.env.PORT || 3000;
const token = process.env.TG_TOKEN!;
const channelId = process.env.TG_CHANNEL!;
let isWorking = false;

const bot = new Telegraf(token);

void bot.launch();

bot.command("start", (ctx) => {
  if (isWorking === false) {
    isWorking = true;
    void ctx.telegram.sendMessage(ctx.chat.id, `${process.env.TG_START_MESSAGE ?? "Started"}`, {});
  } else {
    void ctx.telegram.sendMessage(ctx.chat.id, `Я уже в статусе: ${process.env.TG_START_MESSAGE ?? "Started"}`, {});
  }
});

bot.command("stop", (ctx) => {
  if (isWorking === true) {
    isWorking = false;
    void ctx.telegram.sendMessage(ctx.chat.id, `${process.env.TG_STOP_MESSAGE ?? "Stopped"}`, {});
  } else {
    void ctx.telegram.sendMessage(ctx.chat.id, `Я уже в статусе: ${process.env.TG_STOP_MESSAGE ?? "Stopped"}`, {});
  }
});

bot.command("status", (ctx) => {
  void ctx.telegram.sendMessage(
    ctx.chat.id,
    `Я уже в статусе: ${isWorking ? process.env.TG_START_MESSAGE ?? "Started" : process.env.TG_STOP_MESSAGE ?? "Stopped"}`,
    {}
  );
});

bot.on("message", (ctx) => {
  // Create random with chance 1/3
  const random = Math.floor(Math.random() * 3) + 1;
  // eslint-disable-next-line eqeqeq
  if (random === 1 && isWorking && ctx.message.sender_chat?.id == (process.env.TG_CHANNEL as unknown as number)) {
    void ctx.telegram.sendMessage(ctx.chat.id, `${process.env.TG_COMMENT_TEXT ?? "Lorem ipsum"}`, {
      reply_to_message_id: ctx.message.message_id
    });
  }
});
