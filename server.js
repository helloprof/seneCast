const express = require("express");
const app = express();
const tubeService = require("./tubeService")
const userService = require("./userService")
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

const clientSessions = require("client-sessions");

const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

app.use(express.urlencoded({ extended: true }));

// session data available at req.cookieName i.e. req.session here:
app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "long_unguessable_password_string_web322", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}))

app.use(function(req, res, next) {
  res.locals.session = req.session
  next()
})

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

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

app.get("/videos/add", ensureLogin, (req, res) => {
  // res.sendFile(path.join(__dirname, "/views/addVideos.html"))
  tubeService.getAllChannels().then((channels) => {
    res.render('addVideos', {
      data: channels,
      layout: 'main'
    })
  })

})

app.post("/videos/add", ensureLogin, upload.single("video"), (req, res) => {
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
  }
})

app.get("/channels/add", ensureLogin, (req, res) => {
  // res.sendFile(path.join(__dirname, "views/addChannels.html"))
  res.render('addChannels', {
    layout: 'main'
  })
})

app.post("/channels/add", ensureLogin, (req, res) => {
  tubeService.addChannel(req.body).then(() => {
    res.redirect("/channels")
  }).catch((err) => {
    console.log(err)
  })
})

app.get("/channels/delete/:id", ensureLogin, (req, res) => {
  tubeService.deleteChannel(req.params.id).then(() => {
    res.redirect("/channels")
  })
})

app.get("/videos/delete/:id", ensureLogin, (req, res) => {
  tubeService.deleteVideo(req.params.id).then(() => {
    res.redirect("/videos")
  })
})

app.get("/videos/:id", ensureLogin, (req, res) => {
  tubeService.getVideoById(req.params.id).then((video) => {
    // res.redirect("/videos")
    res.render("index", {
      data: [video],
      layout: 'main'
    })
  })
})

app.get("/register", (req, res) => {
  // res.sendFile(path.join(__dirname, "views/addChannels.html"))
  res.render('register', {
    layout: 'main'
  })
})

app.post("/register", (req, res) => {
  userService.registerUser(req.body).then((success) => {
    // res.redirect("/")
    res.render('register', {
      successMsg: success,
      layout: 'main'
    }) 
  }).catch((err) => {
    res.render('register', {
      errMsg: err,
      layout: 'main'
    })
  })
})

app.get("/login", (req, res) => {
  res.render('login', {
    layout: 'main'
  })
})

app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent')
  userService.loginUser(req.body).then((user) => {
    req.session.user = {
      userName: user.userName,
      email: user.email,
      loginHistory: user.loginHistory
    }

    res.redirect("/")

  }).catch((err) => {
    res.render('login', {
      errMsg: err,
      layout: 'main'
    })
  })
})

app.get("/loginHistory", ensureLogin, (req, res) => {
  res.render('loginHistory', {
    layout: 'main'
  })
})

app.get("/logout", ensureLogin, (req, res) => {
  req.session.reset()
  res.redirect("/");
})

app.use((req, res) => {
  res.status(404).send("Page Not Found");
})

tubeService.initialize()
.then(userService.initialize)
.then(() => {
  app.listen(HTTP_PORT, onHttpStart);
}).catch((err) => {
  console.log(err)
})
