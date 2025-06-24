const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require('os');

module.exports = {
  name: "downloader",
  prefix: false,
  admin: false,
  vip: false,
  author: "ArYAN",
  version: "1.0.3",
  description: "Instant downloader for videos from social media.",
  guide: "[video_link] (Works automatically by sending a link)",
  cooldown: 0,
  category: "media",

  async xyz({ bot, chat, msg, chatId, addListener }) {
    if (msg.text && msg.text.toLowerCase() === `${global.config.prefix}downloader`) {
      await chat.reply("Send a video link, and I'll download it for you!");
      return;
    }

    addListener(
      async (incomingMsg) => {
        const messageText = incomingMsg.link_preview_options?.url || incomingMsg.text || "";
        const meta = {
          keyword: [
            "https://vt.tiktok.com",
            "https://www.tiktok.com/",
            "https://www.facebook.com",
            "https://www.instagram.com/",
            "https://youtu.be/",
            "https://youtube.com/",
            "https://x.com/",
            "https://twitter.com/",
            "https://vm.tiktok.com",
            "https://fb.watch",
          ],
        };
        return meta.keyword.some((url) => messageText.startsWith(url));
      },
      async (incomingMsg) => {
        const messageText = incomingMsg.link_preview_options?.url || incomingMsg.text || "";
        const messageId = incomingMsg.message_id;
        const currentChatId = incomingMsg.chat.id;

        const waitMessage = await chat.reply({
          body: "⏳ Downloading...",
          options: { reply_to_message_id: messageId }
        });
        const waitMId = waitMessage.message_id;

        try {
          const tempDir = path.join(os.tmpdir());
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

          const videoPath = path.join(tempDir, `video_${Date.now()}.mp4`);

          let apiUrl = "";
          let platform = "";

          if (messageText.includes("tiktok")) {
            platform = "tiktok";
            apiUrl = `https://api-aryan-xyz.vercel.app/tikdl?url=${encodeURIComponent(messageText)}&apikey=ArYAN`;
          } else if (messageText.includes("instagram")) {
            platform = "instagram";
            apiUrl = `https://api-aryan-xyz.vercel.app/igdl?url=${encodeURIComponent(messageText)}&apikey=ArYAN`;
          } else if (messageText.includes("facebook") || messageText.includes("fb.watch")) {
            platform = "facebook";
            apiUrl = `https://api-aryan-xyz.vercel.app/fbdl?url=${encodeURIComponent(messageText)}&apikey=ArYAN`;
          } else if (messageText.includes("youtube") || messageText.includes("https://youtu.be/") || messageText.includes("https://youtube.com/")) {
            platform = "youtube";
            apiUrl = `https://api-aryan-xyz.vercel.app/ytdl?url=${encodeURIComponent(messageText)}&apikey=ArYAN`;
          } else if (messageText.includes("x.com") || messageText.includes("twitter.com")) {
            platform = "twitter";
            apiUrl = `https://api-aryan-xyz.vercel.app/x-video?url=${encodeURIComponent(messageText)}&apikey=ArYAN`;
          } else {
            await chat.xyz(waitMessage);
            throw new Error("Unsupported URL or platform.");
          }

          const { data } = await axios.get(apiUrl);

          let videoUrl = "";
          let title = "Video downloaded!";

          switch (platform) {
            case "tiktok":
              videoUrl = data?.result?.url || data?.result?.video_url || data?.result?.videoUrl || data?.result?.result?.video_url;
              title = data?.result?.title || "TikTok Video";
              break;
            case "instagram":
              videoUrl = data?.result?.result?.video_url || data?.result?.video_url || data?.result?.videoUrl;
              title = data?.result?.result?.title || data?.result?.title || "Instagram Video";
              break;
            case "facebook":
              videoUrl = data?.result?.videoUrl || data?.result?.url || data?.result?.response?.["360p"]?.download_url;
              title =
                data?.result?.title ||
                data?.result?.response?.["360p"]?.title ||
                "Facebook Video";
              break;
            case "youtube":
              if (data?.result?.response) {
                videoUrl = data.result.response["720p"]?.download_url || data.result.response["360p"]?.download_url || "";
                title = data.result.response["720p"]?.title || data.result.response["360p"]?.title || "YouTube Video";
              } else {
                videoUrl = data?.result?.url || data?.result;
                title = data?.result?.title || "YouTube Video";
              }
              break;
            case "twitter":
                videoUrl = data?.result?.download_url || data?.result?.url;
                title = data?.result?.title || "X/Twitter Video";
                break;
          }

          if (!videoUrl) throw new Error("No video URL found in API response.");

          const writer = fs.createWriteStream(videoPath);
          const response = await axios({
            method: "GET",
            url: videoUrl,
            responseType: "stream",
          });

          response.data.pipe(writer);
          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });

          await chat.xyz(waitMessage);

          await chat.reply({
            type: 'video',
            attachment: videoPath,
            body: `✅ Download successful! ${title}`,
            options: { reply_to_message_id: messageId }
          });

          fs.unlinkSync(videoPath);
        } catch (error) {
          await chat.xyz(waitMessage);
          await chat.reply({
            body: `❎ Error: ${error.message}`,
            options: { reply_to_message_id: messageId }
          });
          console.error(`Downloader error: ${error.message}`);
        }
      }
    );
  }
};
