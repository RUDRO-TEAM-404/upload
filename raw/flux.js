const axios = require("axios");


const secureAuthor = Buffer.from("QmFZaWppZA==", "base64").toString("utf-8");

module.exports = {
  name: "flux",
  prefix: true,
  admin: false,
  role: 0,
  vip: false,
  author: "BaYjid", 
  version: "2.1.0",

  async xyz({ msg, chat, args }) {

    if (this.author !== secureAuthor) {
      return chat.sendMessage("⚠️ Author mismatch detected. Only the original developer is allowed.");
    }

    if (!args || args.length === 0) {
      return chat.sendMessage(
        "❗ Usage: .flux <your prompt>\n\n" +
        "🧠 Example: .flux What is AI?\n\n" +
        "💡 Give me something to work with!"
      );
    }

    const prompt = encodeURIComponent(args.join(" "));
    const apiUrl = `https://aryan-xyz-flux-sigma.vercel.app/flux?prompt=${prompt}`;

    try {
      const res = await axios.get(apiUrl);
      const result = res.data?.result;

      if (!result) {
        return chat.sendMessage("❌ No result received. Try another prompt!");
      }

      const reply =
        "🤖 Flux AI Response\n" +
        "━━━━━━━━━━━━━━━\n" +
        "📥 Prompt: " + args.join(" ") + "\n\n" +
        "📤 Output:\n" + result + "\n\n" +
        "🔗 Powered by Xass";

      return chat.sendMessage(reply);
    } catch (err) {
      console.error(err);
      return chat.sendMessage(
        "🚫 Oops! Something went wrong.\nPlease try again later or contact support."
      );
    }
  }
};
