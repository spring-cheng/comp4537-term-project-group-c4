import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { MESSAGES } from "./public/lang/messages/en/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) => {
    res.render("register", { messages: MESSAGES });
});

app.get("/login", (req, res) => {
  res.render("login", { messages: MESSAGES });
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard", { messages: MESSAGES });
});

app.get("/admin", (req, res) => {
  res.render("admin", { messages: MESSAGES });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
