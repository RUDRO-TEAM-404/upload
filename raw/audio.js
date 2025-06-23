const fetch = require("node-fetch");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "sing",
    aliases: ["music", "song"],
    version: "0.0.2",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: "sing tomake chai",
    longDescription: "sing janne kyun tanveer evan",
    category: "MUSIC",
    guide: "/sing Shape of You"
  },

  xyz: async function({ api, event, args }) {
    const chatId = event.chat.id;
    const msgId = event.message_id;
    const songName = args.join(" ");
    const type = "audio";

    if (!songName) {
      return api.sendMessage(chatId, "🚫 Please provide a song name (e.g. `/sing Shape of You`).", {
        reply_to_message_id: msgId,
        parse_mode: "Markdown",
      });
    }

    const loadingMsg = await api.sendMessage(chatId, "⌛ Searching and downloading your song...", {
      reply_to_message_id: msgId,
    });

    try {
      const searchResults = await ytSearch(songName);
      if (!searchResults?.videos?.length) throw new Error("No results found.");

      const top = searchResults.videos[0];
      const apiUrl = `https://noobs-xyz-aryan.vercel.app/youtube?id=${top.videoId}&type=${type}&apikey=itzaryan`;

      const downloadRes = await axios.get(apiUrl);
      if (!downloadRes.data?.downloadUrl) throw new Error("No downloadUrl received.");

      const dlUrl = downloadRes.data.downloadUrl;
      const res = await fetch(dlUrl);
      if (!res.ok) throw new Error(`Download failed (status: ${res.status}).`);

      const fileBuffer = await res.buffer();
      const fileExt = type === "audio" ? "mp3" : "mp4";
      const fileName = `${top.title}.${fileExt}`.replace(/[\\/:"*?<>|]+/g, "");
      const filePath = path.join(__dirname, fileName);
      fs.writeFileSync(filePath, fileBuffer);

      await api.deleteMessage(chatId, loadingMsg.message_id);

      await api.sendAudio(chatId, fs.createReadStream(filePath), {
        caption: `🎵 MUSIC\n━━━━━━━━━━━━━━━\n\n${top.title}`,
        parse_mode: "Markdown",
        reply_to_message_id: msgId,
      });

      fs.unlinkSync(filePath);
    } catch (err) {
      await api.deleteMessage(chatId, loadingMsg.message_id);
      await api.sendMessage(chatId, "❌ Failed to download the song. Please try again later.", {
        reply_to_message_id: msgId,
      });
      console.error("Sing command error:", err);
    }
  }
};
