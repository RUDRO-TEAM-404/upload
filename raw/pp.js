const axios = require('axios');

module.exports = {
  name: "profile",
  version: "0.0.1",
  aliases: ["pfp", "avatar"],
  description: "Sends the user's Telegram profile picture.",
  author: "ArYAN",
  prefix: true,
  category: "utility",
  cooldown: 5,

  async xyz({ chat, msg, userId, bot }) {
    try {
      if (!bot || typeof bot.getUserProfilePhotos !== 'function') {
        console.error("Bot instance or getUserProfilePhotos method not available.");
        return await chat.reply("I cannot access profile pictures. My internal bot configuration might be incomplete.");
      }

      const profilePhotos = await bot.getUserProfilePhotos(userId);

      if (profilePhotos && profilePhotos.photos && profilePhotos.photos.length > 0) {
        const latestPhoto = profilePhotos.photos[0];
        const largestPhoto = latestPhoto[latestPhoto.length - 1];

        await chat.sendPhoto(msg.chat.id, largestPhoto.file_id);
      } else {
        await chat.reply("You don't have a profile picture set or I couldn't retrieve it.");
      }

    } catch (error) {
      console.error("Error fetching profile picture:", error);
      await chat.reply("An error occurred while trying to fetch the profile picture. Please make sure you have a profile picture set.");
    }
  }
};
