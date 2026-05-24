const express = require("express");
const app = express();

const VERIFY_TOKEN = "rekha";

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.use(express.json());

app.post("/webhook", (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
