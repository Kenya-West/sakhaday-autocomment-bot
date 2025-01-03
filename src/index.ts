/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as dotenv from "dotenv";
import { Telegraf } from "telegraf";

const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 60 }); // Cache for 60 seconds (adjust as needed)

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
  if (isAutomaticForwaredMessage(ctx)) {
    // Create random with chance 1/3
    const random = Math.floor(Math.random() * Number(process.env.RANDOM_SEED ?? 3)) + 1;
    // eslint-disable-next-line eqeqeq
    if (random === 1 && isWorking) {
      // void ctx.telegram.sendMessage(ctx.chat.id, `${process.env.TG_COMMENT_TEXT ?? "Lorem ipsum"}`, {
      //   reply_to_message_id: ctx.message.message_id
      // });

      // Check if it's part of a media group (album)
      const message = ctx.message as any;

      if (message.media_group_id) {
        // Check if we've already replied to this media group
        if (cache.has(message.media_group_id)) {
          return; // Do nothing if already handled
        }

        // Store media_group_id to ensure only one reply
        cache.set(message.media_group_id, true);

        // Send a single reply for the album
        replyToMessage(ctx, `${process.env.TG_COMMENT_TEXT ?? "Lorem ipsum"}`);
      } else {
        // Handle regular single messages
        replyToMessage(ctx, `${process.env.TG_COMMENT_TEXT ?? "Lorem ipsum"}`);
      }
    }
  }
});

function isAutomaticForwaredMessage(ctx: any): boolean {
  return (
    // eslint-disable-next-line prettier/prettier, eqeqeq
    ctx.message.forward_from_chat?.id == channelId &&
    // eslint-disable-next-line eqeqeq
    ctx.message.sender_chat?.id == channelId &&
    ctx.message.is_automatic_forward === true
  );
}

function replyToMessage(ctx: any, text: string): void {
  void ctx.replyWithMarkdownV2(text, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    reply_to_message_id: ctx.message.message_id,
    parse_mode: "MarkdownV2",
    disable_web_page_preview: true
  });
}
