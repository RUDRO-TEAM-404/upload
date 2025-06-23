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
        '0': '𝟘', '1': '𝟙', '2': '𝟚', '3': '𝟛', '4': '𝟜',
        '5': '𝟝', '6': '𝟞', '7': '𝟟', '8': '𝟠', '9': '𝟡',
        'D': '𝒟', 'H': '𝐻', 'M': '𝑀', 'S': '𝒮', ':': ':',
        ' ': ' '
      };
      return text.split('').map(char => mapping[char] || char).join('');
    };

    const uptimeMessage =
      `🌸 *Bot Uptime* 🌸\n\n` +
      `╰┈➤ ${cuteFont(d)}𝒟 ${cuteFont(h)}𝐻 ${cuteFont(m)}𝑀 ${cuteFont(s)}𝒮\n\n` +
      `✨ _Always here to help!_ ✨`;

    await chat.reply(uptimeMessage);
  }
};
