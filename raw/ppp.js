const axios = require('axios');

function getTelegramApiClient(context) {
  if (context.bot && typeof context.bot.getUserProfilePhotos === 'function') {
    return context.bot;
  }
  if (context.api && typeof context.api.getUserProfilePhotos === 'function') {
    return context.api;
  }
  if (context.chat && context.chat.api && typeof context.chat.api.getUserProfilePhotos === 'function') {
    return context.chat.api;
  }
  return null;
}

module.exports = {
  name: "profile",
  version: "0.0.1",
  aliases: ["pfp", "avatar"],
  description: "Sends the user's Telegram profile picture.",
  author: "ArYAN",
  prefix: true,
  category: "utility",
  cooldown: 5,

  async xyz({ chat, msg, userId, bot, api }) {
    try {
      const telegramClient = getTelegramApiClient({ chat, msg, userId, bot, api });

      if (!telegramClient) {
        console.error("Could not find a Telegram API client in the provided context.");
        return await chat.reply("I cannot access profile pictures. My internal bot configuration might be incomplete or unsupported.");
      }

      const profilePhotos = await telegramClient.getUserProfilePhotos(userId);

      if (profilePhotos && profilePhotos.photos && profilePhotos.photos.length > 0) {
        const latestPhoto = profilePhotos.photos[0];
        const largestPhoto = latestPhoto[latestPhoto.length - 1];

        await chat.sendPhoto(msg.chat.id, largestPhoto.file_id);
      } else {
        await chat.reply("You don't have a profile picture set or I couldn't retrieve it.");
      }

    } catch (error) {
      console.error("Error fetching profile picture:", error);
      console.error("Full Error Object:", error);

      let errorMessage = "An error occurred while trying to fetch the profile picture.";
      if (error.response && error.response.description) {
        errorMessage += ` Telegram API Error: ${error.response.description}`;
      } else if (error.message) {
        errorMessage += ` Error Details: ${error.message}`;
      }
      await chat.reply(errorMessage + " Please make sure you have a profile picture set.");
    }
  }
};
