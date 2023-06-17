const express = require("express");
const app = express();
const tubeService = require("./tubeService")
const path = require("path")

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));

function onHttpStart() {
  console.log("server is ready on " + HTTP_PORT + " 🚀🚀🚀!!");
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/index.html"))
  // res.redirect("/about")
});

app.get("/videos", (req, res) => {
  tubeService.getAllVideos().then((videos) => {
    res.json(videos)
  })
})

app.get("/channels", (req, res) => {
  tubeService.getAllChannels().then((channels) => {
    res.json(channels)
  })
})

app.get("/channels/add", (req, res) => {
  res.sendFile(path.join(__dirname, "views/addChannels.html"))
})

app.post("/channels/add", (req, res) => {
  tubeService.addChannel(req.body).then(() => {
    res.redirect("/channels")
  }).catch((err) => {
    console.log(err)
  })
})


app.use((req, res) => {
  res.status(404).send("Page Not Found");
})

tubeService.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart);
})
