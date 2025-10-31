import cors from "cors";
import express from "express";
import { initUserTable } from "./db/users.js";
import { userMessages } from "./lang/en/messages.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

(async () => {
  await initUserTable();
})();

app.get("/", (_req, res) => {
  res.json({ message: userMessages.SERVER_RUNNING });
});

app.listen(PORT, () =>
  console.log(`${userMessages.SERVER_RUNNING} Port ${PORT}`)
);
