const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");

module.exports = {
  name: "sing",
  prefix: true,
  admin: false,
  vip: false,
  role: 0,
  author: "ArYAN",
  version: "0.0.1",
  description: "Searches and sends music/songs from YouTube.",
  category: "music",
  cooldown: 5,
  guide: "{p}sing <song name> [audio/video]",

  async xyz({ chat, msg, args }) {
    if (!args.length) {
      return chat.reply("Please provide a song name to search for.\nUsage: `{p}sing <song name> [audio/video]`");
    }

    let downloadType = "audio";
    const lastArg = args[args.length - 1].toLowerCase();

    let songName;
    if (lastArg === "audio" || lastArg === "video") {
      downloadType = lastArg;
      songName = args.slice(0, -1).join(" ");
    } else {
      songName = args.join(" ");
    }

    if (!songName) {
      return chat.reply("Please provide a song name to search for.");
    }

    const processingMessage = await chat.reply("🎵 Searching and preparing your song...");

    try {
      const searchResults = await ytSearch(songName);

      if (!searchResults || !searchResults.videos.length) {
        await chat.editMessageText("❌ No results found for your search query.", {
          message_id: processingMessage.message_id,
        });
        return;
      }

      const topResult = searchResults.videos[0];
      const videoId = topResult.videoId;
      const songTitle = topResult.title;

      const apiKey = "itzaryan";
      const apiUrl = `https://noobs-xyz-aryan.vercel.app/youtube?id=${videoId}&type=${downloadType}&apikey=${apiKey}`;

      await chat.editMessageText(`⏳ Found "${songTitle}". Downloading...`, {
        message_id: processingMessage.message_id,
      });

      const downloadResponse = await axios.get(apiUrl);
      const downloadUrl = downloadResponse.data.downloadUrl;

      if (!downloadUrl) {
        throw new Error("Failed to get download URL from the API.");
      }

      const response = await axios({
        method: "get",
        url: downloadUrl,
        responseType: "stream",
      });

      const fileExtension = downloadType === "audio" ? "mp3" : "mp4";
      const safeTitle = songTitle.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${safeTitle}.${fileExtension}`;
      const downloadPath = path.join(__dirname, filename);

      const writer = fs.createWriteStream(downloadPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await chat.editMessageText(`✅ Downloaded "${songTitle}". Sending...`, {
        message_id: processingMessage.message_id,
      });

      if (downloadType === "audio") {
        await chat.sendAudio(downloadPath, {
          caption: songTitle,
          parse_mode: "Markdown",
        });
      } else {
        await chat.sendVideo(downloadPath, {
          caption: songTitle,
          parse_mode: "Markdown",
        });
      }

      fs.unlinkSync(downloadPath);
      await chat.deleteMessage(processingMessage.message_id);

    } catch (error) {
      console.error(`Error in sing command: ${error.message}`);
      if (processingMessage && processingMessage.message_id) {
        await chat.deleteMessage(processingMessage.message_id).catch(() => {});
      }
      await chat.reply(`⚠️ Failed to download or send song: ${error.message}`);
    }
  },
};
