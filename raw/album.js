async xyz({ bot, chat, msg, args, addAnswerCallback, config }) {
    const categories = [
      { displayName: "Funny Video", realName: "funny", caption: "Here's your Funny Video!" },
      { displayName: "Islamic Video", realName: "islamic", caption: "Here's your Islamic Video!" },
      { displayName: "Sad Video", realName: "sad", caption: "Here's your Sad Video!" },
      { displayName: "Anime Video", realName: "anime", caption: "Here's your Anime Video!" },
      { displayName: "LoFi Video", realName: "lofi", caption: "Here's your LoFi Video!" },
      { displayName: "Attitude Video", realName: "attitude", caption: "Here's your Attitude Video!" },
      { displayName: "Horny Video", realName: "horny", caption: "Here's your Horny Video!" },
      { displayName: "Couple Video", realName: "couple", caption: "Here's your Couple Video!" },
      { displayName: "Flower Video", realName: "flower", caption: "Here's your Flower Video!" },
      { displayName: "Bike & Car Video", realName: "bikecar", caption: "Here's your Bike & Car Video!" },
      { displayName: "Love Video", realName: "love", caption: "Here's your Love Video!" },
      { displayName: "Lyrics Video", realName: "lyrics", caption: "Here's your Lyrics Video!" },
      { displayName: "Cat Video", realName: "cat", caption: "Here's your Cat Video!" },
      { displayName: "18+ Video", realName: "18+", caption: "Here's your 18+ Video!" },
      { displayName: "Free Fire Video", realName: "freefire", caption: "Here's your Free Fire Video!" },
      { displayName: "Football Video", realName: "football", caption: "Here's your Football Video!" },
      { displayName: "Baby Video", realName: "baby", caption: "Here's your Baby Video!" },
      { displayName: "Friends Video", realName: "friend", caption: "Here's your Friends Video!" },
      { displayName: "Pubg video", realName: "pubg", caption: "Here's your Pubg Video!" },
      { displayName: "Aesthetic Video", realName: "aesthetic", caption: "Here's your Aesthetic Video!" },
      { displayName: "Naruto Video", realName: "naruto", caption: "Here's your Naruto Video!" },
      { displayName: "Dragon Ball Video", realName: "dragon", caption: "Here's your Dragon Ball Video!" },
      { displayName: "Bleach Video", realName: "bleach", caption: "Here's your Bleach Video!" },
      { displayName: "Demon Slayer Video", realName: "demon", caption: "Here's your Demon Slayer Video!" },
      { displayName: "Jujutsu Kaisen Video", realName: "jjk", caption: "Here's your Jujutsu Kaisen Video!" },
      { displayName: "Solo Leveling Video", realName: "solo", caption: "Here's your Solo Leveling Video!" },
      { displayName: "Tokyo Revenger Video", realName: "tokyo", caption: "Here's your Tokyo Revengers Video!" },
      { displayName: "Blue Lock Video", realName: "bluelock", caption: "Here's your Blue Lock Video!" },
      { displayName: "Chainsaw Man Video", realName: "cman", caption: "Here's your Chainsaw Man Video!" },
      { displayName: "Death Note Video", realName: "deathnote", caption: "Here's your Death Note Video!" },
      { displayName: "One Piece Video", realName: "onepiece", caption: "Here's your One Piece Video!" },
      { displayName: "Attack on Titan Video", realName: "attack", caption: "Here's your Attack on Titan Video!" },
      { displayName: "Sakamoto Days Video", realName: "sakamoto", caption: "Here's your Sakamoto Days Video!" },
      { displayName: "Wind Breaker Video", realName: "wind", caption: "Here's your Wind Breaker Video!" },
      { displayName: "One Punch Man Video", realName: "onepman", caption: "Here's your One Punch Man Video!" },
      { displayName: "Alya Russian Video", realName: "alya", caption: "Here's your Alya Russian Video!" },
      { displayName: "Blue Box Video", realName: "bluebox", caption: "Here's your Blue Box Video!" },
      { displayName: "Hunter x Hunter Video", realName: "hunter", caption: "Here's your Hunter x Hunter Video!" },
      { displayName: "Loner Life Video", realName: "loner", caption: "Here's your Loner Life Video!" },
      { displayName: "Hanime Video", realName: "hanime", caption: "Here's your Hanime Video!" },
    ];

    if (args[0] === "add") {
      if (!config.admins.includes(msg.from.id.toString())) {
        return chat.reply({ body: "❌ You are not authorized to add videos to the album." });
      }

      if (!args[1]) {
        return chat.reply({ body: "❌ Please specify a category. Usage: `!album add [category]`" });
      }

      const category = args[1].toLowerCase();
      let videoUrl = args[2];

      if (msg.reply_to_message && msg.reply_to_message.video) {
        return chat.reply({ body: "Adding videos via reply is currently supported only for direct URLs. Please provide a direct video URL." });
      }

      if (!videoUrl) {
        return chat.reply({ body: "❌ Please provide a video URL or reply to a video message with `!album add [category]`." });
      }

      try {
        const uploadResponse = await axios.post(`${API_BASE_URL}/album/add`, {
          category,
          videoUrl,
        });
        return chat.reply({ body: uploadResponse.data.message });
      } catch (error) {
        console.error("Error adding video:", error.response?.data || error.message);
        return chat.reply({ body: `❌ Failed to add video: ${error.response?.data?.error || error.message}` });
      }
    } else if (args[0] === "list") {
      try {
        const response = await axios.get(`${API_BASE_URL}/album/list`);
        return chat.reply({ body: response.data.message });
      } catch (error) {
        console.error("Error listing categories:", error);
        return chat.reply({ body: `❌ Failed to list categories: ${error.message}` });
      }
    } else {
      const itemsPerRow = 2;
      const itemsPerPage = 16;
      const totalPages = Math.ceil(categories.length / itemsPerPage);
      let currentPage = parseInt(args[0]) || 1;

      if (currentPage < 1 || currentPage > totalPages) {
        currentPage = 1;
      }

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const displayedCategories = categories.slice(startIndex, endIndex);

      const inline_keyboard = [];

      for (let i = 0; i < displayedCategories.length; i += itemsPerRow) {
        const row = [];
        for (let j = 0; j < itemsPerRow; j++) {
          const categoryIndex = startIndex + i + j;
          if (categoryIndex < categories.length) {
            const cat = categories[categoryIndex];
            row.push({ text: cat.displayName, callback_data: `album_category_${categoryIndex}_${msg.from.id}` });
          }
        }
        if (row.length > 0) {
          inline_keyboard.push(row);
        }
      }

      if (totalPages > 1) {
        const pageButtons = [];
        if (currentPage > 1) {
          pageButtons.push({ text: "◀️ Previous", callback_data: `album_page_${currentPage - 1}_${msg.from.id}` });
        }
        pageButtons.push({ text: `Page ${currentPage}/${totalPages}`, callback_data: `album_current_page_info_${msg.from.id}` });
        if (currentPage < totalPages) {
          pageButtons.push({ text: "Next ▶️", callback_data: `album_page_${currentPage + 1}_${msg.from.id}` });
        }
        inline_keyboard.push(pageButtons);
      }

      const messageBody = `*Available Album Videos (Page ${currentPage}/${totalPages})*\n\n_Choose a category:_`;

      const sentMsg = await chat.reply({
        body: messageBody,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inline_keyboard,
        },
      });

      categories.forEach((cat, index) => {
        addAnswerCallback(`album_category_${index}_${msg.from.id}`, async ({ bot, chat, query }) => {
          if (query.from.id.toString() !== msg.from.id.toString()) {
            await bot.answerCallbackQuery(query.id, { text: "This button is not for you!", show_alert: true });
            return;
          }

          await bot.editMessageText(`*Fetching video for ${cat.displayName}...*`, {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            parse_mode: 'Markdown'
          });

          let filePath = '';
          try {
            const videoResponse = await axios.get(`${API_BASE_URL}/videos/${cat.realName}?userID=${query.from.id}`);

            if (!videoResponse.data.success || !videoResponse.data.videos || videoResponse.data.videos.length === 0) {
              return bot.editMessageText("❌ | No videos found for this category.", {
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
                parse_mode: 'Markdown'
              });
            }

            const randomVideoUrl = videoResponse.data.videos[Math.floor(Math.random() * videoResponse.data.videos.length)];
            filePath = path.join(__dirname, `temp_video_${Date.now()}.mp4`);

            await downloadFile(randomVideoUrl, filePath);

            await bot.sendVideo(query.message.chat.id, require('fs').createReadStream(filePath), { caption: cat.caption });

            await bot.deleteMessage(query.message.chat.id, query.message.message_id);

          } catch (error) {
            console.error("Error fetching or sending video:", error);
            await bot.editMessageText("❌ | Failed to get video. Please try again later.", {
              chat_id: query.message.chat.id,
              message_id: query.message.message_id,
              parse_mode: 'Markdown'
            });
          } finally {
            if (filePath) {
              try {
                await fs.unlink(filePath);
              } catch (err) {
                console.error("Failed to delete temp video file:", err);
              }
            }
          }
        });
      });

      for (let i = 1; i <= totalPages; i++) {
        addAnswerCallback(`album_page_${i}_${msg.from.id}`, async ({ bot, chat, query }) => {
          if (query.from.id.toString() !== msg.from.id.toString()) {
            await bot.answerCallbackQuery(query.id, { text: "This button is not for you!", show_alert: true });
            return;
          }
          await bot.deleteMessage(query.message.chat.id, query.message.message_id);
          await module.exports.xyz({ bot, chat, msg: { ...msg, text: `!album ${i}` }, args: [`${i}`], addAnswerCallback, config });
        });
      }
    }
  },
};

const downloadFile = async (url, filePath) => {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  return new Promise(async (resolve, reject) => {
    const writer = require('fs').createWriteStream(filePath);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", (err) => {
      console.error("File download error:", err);
      reject(err);
    });
  });
};
