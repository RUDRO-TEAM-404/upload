const yts = require("yt-search");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
 config: {
 name: "sing",
 version: "0.0.4",
 author: "ArYAN",
 countDown: 5,
 role: 0,
 description: {
 en: "Search and download YouTube audio (under 1 hour)"
 },
 category: "media",
 guide: {
 en: "{pn} <song name>: Search and download audio"
 }
 },

 onStart: async function ({ args, message, event, commandName, api }) {
 const query = args.join(" ");
 if (!query) return message.SyntaxError();

 const searchResults = await searchYouTube(query);
 if (searchResults.length === 0) return message.reply("❌ No results found.");

 const limited = searchResults.slice(0, 6);
 const body = limited.map((v, i) => `${i + 1}. ${v.title}`).join("\n\n");

 const msg = await message.reply({
 body: `🎵 Please choose a song to download audio:\n\n${body}`,
 attachment: await Promise.all(limited.map(v => getStreamFromURL(v.thumbnail)))
 });

 global.GoatBot.onReply.set(msg.messageID, {
 commandName,
 messageID: msg.messageID,
 author: event.senderID,
 searchResults: limited
 });
 },

 onReply: async ({ event, api, Reply, message }) => {
 const { searchResults } = Reply;
 const choice = parseInt(event.body);

 if (!isNaN(choice) && choice >= 1 && choice <= searchResults.length) {
 const selected = searchResults[choice - 1];
 await api.unsendMessage(Reply.messageID);
 const loading = await message.reply("🎶 Downloading audio...");

 try {
 const infoText = `✅ Title: ${selected.title}\n🕒 Duration: ${selected.duration}\n👀 Views: ${selected.views}\n\n📺 Channel: ${selected.channel}\n\n🔗 URL: ${selected.url}`;
 const videoId = extractVideoId(selected.url);
 await downloadYouTubeAudio(videoId, message, infoText);
 await api.unsendMessage(loading.messageID);
 } catch (err) {
 await api.unsendMessage(loading.messageID);
 message.reply(`❌ Download failed: ${err.message}`);
 }
 } else {
 message.reply("❌ Invalid selection. Please reply with a number between 1 and 6.");
 }
 }
};

async function searchYouTube(query) {
 const res = await yts(query);
 return res.videos
 .filter(v => v.duration.seconds <= 3600)
 .map(v => ({
 id: v.videoId,
 title: v.title,
 duration: v.timestamp,
 views: v.views,
 channel: v.author.name,
 thumbnail: v.thumbnail,
 url: `https://www.youtube.com/watch?v=${v.videoId}`
 }));
}

async function downloadYouTubeAudio(videoId, message, infoText = "") {
 const { data } = await axios.get(`https://aryan-ai-seven.vercel.app/ytmp3?query=https://www.youtube.com/watch?v=${videoId}&format=mp3`);
 const audioUrl = data.data || data.url;
 const tempPath = path.join(__dirname, "yt_audio.mp3");

 const writer = fs.createWriteStream(tempPath);
 const res = await axios({ url: audioUrl, responseType: "stream" });
 res.data.pipe(writer);

 await new Promise((resolve, reject) => {
 writer.on("finish", resolve);
 writer.on("error", reject);
 });

 await message.reply({
 body: `${infoText}\n\n🎧 Here's your audio:`,
 attachment: fs.createReadStream(tempPath)
 });

 fs.unlink(tempPath, () => {});
}

async function getStreamFromURL(url) {
 const res = await axios({ url, responseType: "stream" });
 return res.data;
}

function extractVideoId(url) {
 const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
 return match ? match[1] : null;
}