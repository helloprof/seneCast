const express = require("express");
const app = express();
const tubeService = require("./tubeService")
const path = require("path")

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const env = require("dotenv")
env.config()

const upload = multer(); // no { storage: storage } 
app.use(express.urlencoded({ extended: true }));
const exphbs = require('express-handlebars');
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

app.use(express.urlencoded({ extended: true }));

function onHttpStart() {
  console.log("server is ready on " + HTTP_PORT + " 🚀🚀🚀!!");
}

app.get("/", (req, res) => {
  // res.sendFile(path.join(__dirname, "/views/index.html"))
  tubeService.getAllVideos().then((videos) => {
    // res.json(videos)
    res.render('index', {
      data: videos,
      layout: 'main'
    })
  }).catch((err) => {
    console.log(err)
  })

})

app.get("/videos", (req, res) => {
  tubeService.getAllVideos().then((videos) => {
    // res.json(videos)
    res.render('index', {
      data: videos,
      layout: 'main'
    })
  }).catch((err) => {
    console.log(err)
  })
})

app.get("/channels", (req, res) => {
  tubeService.getAllChannels().then((channels) => {
    // res.json(channels)
    res.render('channels', {
      data: channels,
      layout: 'main'
    })
  }).catch((err) => {
    console.log(err)
  })
})

app.get("/videos/add", (req, res) => {
  // res.sendFile(path.join(__dirname, "/views/addVideos.html"))
  tubeService.getAllChannels().then((channels) => {
    res.render('addVideos', {
      data: channels,
      layout: 'main'
    })
  })

})

app.post("/videos/add", upload.single("video"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          {resource_type: "video"},
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
  // res.sendFile(path.join(__dirname, "views/addChannels.html"))
  res.render('addChannels', {
    layout: 'main'
  })
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
}).catch((err) => {
  console.log(err)
})
