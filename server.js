const express = require("express");
const app = express();
const tubeService = require("./tubeService")
const path = require("path")

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

const upload = multer(); // no { storage: storage } 
app.use(express.urlencoded({ extended: true }));

const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
  cloud_name: "",
  api_key: "",
  api_secret: "",
  secure: true
});

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

app.get("/videos/new", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addVideos.html"))
})

app.post("/videos/new", upload.single("video"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processPost(uploaded.url);
    });
  } else {
    processPost("");
  }

  function processPost(uploadURL) {
    req.body.video = uploadURL;
    tubeService.addVideo(req.body).then(() => {
      res.redirect("/videos")
    }).catch((err) => {
      res.redirect("/videos/add")
      console.log(err)
      
    })
    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
  }


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
