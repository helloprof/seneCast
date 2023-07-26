const fs = require("fs")
let videos = [0]
let channels = [0]

const env = require("dotenv")
env.config()

const Sequelize = require("sequelize")

var sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_DB, process.env.POSTGRES_PASSWORD, {
  host: process.env.POSTGRES_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
      ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

// sequelize.authenticate().then(() => {
//   console.log("credentials are good!")
// })

var Channel = sequelize.define('Channel', {
  channelID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  channel: Sequelize.STRING,
  // displayPic: 
})

var Video = sequelize.define('Video', {
  videoID: { 
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: Sequelize.STRING,
  description: Sequelize.STRING,
  video: Sequelize.STRING,
  date: Sequelize.DATE,
  comments: Sequelize.ARRAY(Sequelize.TEXT),
  likes: Sequelize.INTEGER,
  views: Sequelize.INTEGER
})

Video.belongsTo(Channel, {foreignKey: 'channelID'})

module.exports.initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize.sync().then(() => {
      console.log("POSTGRES DB SYNC'D!")
      resolve()
    }).catch((err) => {
      console.log("POST GRES DB COULD NOT BE SYNC'D, ERR: "+err)
      reject(err)
    })
  })
}


module.exports.getAllVideos = () => {
  return new Promise((resolve, reject) => {
    Video.findAll().then((videos) => {
      if (videos) {
        resolve(videos)
      } else {
        reject("No videos found")
      }
    })
  })
}

module.exports.getAllChannels = () => {
  return new Promise((resolve, reject) => {
    Channel.findAll().then((channels) => {
      console.log(channels)
      resolve(channels)
    }).catch((err) => {
      console.log("CHANNELS ERROR: "+err)
    })
  })
}

module.exports.addVideo = (videoSubmitted) => {
  return new Promise((resolve, reject) => {
    Video.create(videoSubmitted).then(() => {
      console.log("VIDEO ADDED")
      resolve()
    }).catch((err) => {
      console.log("VIDEO UPLOAD ERROR!")
      reject(err)
    })
  })
}

module.exports.addChannel = (channel) => {
  return new Promise((resolve, reject) => {

    if (channel) {
      Channel.create(channel).then(() => {
        console.log("CHANNEL CREATED!")
        resolve()
      }).catch((err) => {
        console.log("CHANNEL CREATION ERROR: "+err)
      })
    } else {
      reject()
    }
  })
}

module.exports.getVideoById = (videoID) => {
  return new Promise((resolve, reject) => {
    Video.findOne({
      where: {
        videoID: videoID
      }
    }).then((video) => {
      if (video) {
        resolve(video)
      } else {
        reject("Video not found")
      }
    }).catch((err) => {
      console.log("Get video by ID error: "+err)
      reject(err)
    })
  })
}

module.exports.deleteVideo = (videoID) => {
  return new Promise((resolve, reject) => {
    Video.destroy({
      where: {
        videoID: videoID
      }
    }).then(() => {
      console.log("VIDEO DELETED")
      resolve()
    }).catch((err) => {
      console.log("VIDEO DELETE FAILED")
      reject(err)
    })
  })
}

module.exports.deleteChannel = (channelID) => {
  return new Promise((resolve, reject) => {
    Channel.destroy({
      where: {
        channelID: channelID
      }
    }).then(() => {
      console.log("CHANNEL DELETED")
      resolve()
    }).catch((err) => {
      console.log("CHANNEL DELETE FAILED")
      reject(err)
    })
  })
}
