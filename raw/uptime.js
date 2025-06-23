module.exports = {
  name: 'uptime',
  author: 'ArYAN',
  version: '0.0.1',
  description: 'Displays the bot\'s uptime with cute formatting.',
  usage: 'uptime',
  category: 'UTILITY',
  async xyz({ chat }) {
    const uptimeInSeconds = process.uptime();

    const seconds = Math.floor(uptimeInSeconds % 60);
    const minutes = Math.floor((uptimeInSeconds / 60) % 60);
    const hours = Math.floor((uptimeInSeconds / (60 * 60)) % 24);
    const days = Math.floor(uptimeInSeconds / (60 * 60 * 24));

    const formatTime = (value) => value.toString().padStart(2, '0');

    const d = formatTime(days);
    const h = formatTime(hours);
    const m = formatTime(minutes);
    const s = formatTime(seconds);

    const cuteFont = (text) => {
      const mapping = {
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
        '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
        'D': 'D', 'H': 'D', 'M': 'M', 'S': 'S', ':': ':',
        ' ': ' '
      };
      return text.split('').map(char => mapping[char] || char).join('');
    };

    const uptimeMessage =
      `🌸 *Bot Uptime* 🌸\n\n` +
      `╰┈➤ ${cuteFont(d)}Day's ${cuteFont(h)}Hour's ${cuteFont(m)}Minute's${cuteFont(s)}Second's\n\n` +
      `✨ _Always here to help!_ ✨`;

    await chat.reply(uptimeMessage);
  }
};
