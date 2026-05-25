const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  console.log("BODY:", JSON.stringify(req.body, null, 2));
  next();
});
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const greetedUsers = new Set();
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {

    const message =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message) {

      const from = message.from;
      const messageId = message.id;
      const text = message.text?.body?.toLowerCase() || "";

      if (greetedUsers.has(from)) {
        return res.sendStatus(200);
      }

      greetedUsers.add(from);

      await axios.post(
        `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          status: "read",
          message_id: messageId
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );

      await new Promise(resolve => setTimeout(resolve, 60000));

      await axios.post(
        `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          type: "video",
          video: {
            link: "https://res.cloudinary.com/dalnjvmra/video/upload/v1779695040/WhatsApp_Video_2026-05-25_at_11.59.16_AM_1_agpefu.mp4",
            caption: "Namaste 🙏\n\nMain aapki problem ko thik karne ke liye vedic puja karti hu 🔮"
          }
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );

      await axios.post(
        `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          type: "interactive",
          interactive: {
            type: "cta_url",
            body: {
              text: "Click below to see website reviews 👇"
            },
            action: {
              name: "cta_url",
              parameters: {
                display_text: "🌐 Website",
                url: "https://www.rekhaastrology.in"
              }
            }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );

      return res.sendStatus(200);
    }

    res.sendStatus(200);

  } catch (error) {

    console.log(error.response?.data || error.message);

    res.sendStatus(500);

  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
