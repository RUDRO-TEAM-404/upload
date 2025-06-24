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

  async xyz({ chat, msg, userId }) {
    try {
      const profilePhotos = await chat.getUserProfilePhotos(userId);

      if (profilePhotos && profilePhotos.photos && profilePhotos.photos.length > 0) {
        const latestPhoto = profilePhotos.photos[0];
        const largestPhoto = latestPhoto[latestPhoto.length - 1];

        await chat.sendPhoto(msg.chat.id, largestPhoto.file_id);
      } else {
        await chat.reply("You don't have a profile picture set or I couldn't retrieve it.");
      }

    } catch (error) {
      console.error("Error fetching profile picture:", error);
      await chat.reply("An error occurred while trying to fetch the profile picture.");
    }
  }
};
