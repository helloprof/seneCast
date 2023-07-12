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
      reject()
    })
  })
}


module.exports.getAllVideos = () => {
  return new Promise((resolve, reject) => {
    if (videos.length == 0) {
      reject("no videos found!")
    }
    // filteredVideos = videos.filter(post => post.id == id)
    resolve(videos)
  })
}

module.exports.getAllChannels = () => {
  return new Promise((resolve, reject) => {
    // if (channels.length == 0) {
    //   reject("no videos found!")
    // }
    // resolve(channels)
    Channel.findAll().then((channels) => {
      console.log(channels)
      resolve(channels)
    }).catch((err) => {
      console.log("CHANNELS ERROR: "+err)
    })
  })
}

module.exports.addVideo = (video) => {
  return new Promise((resolve, reject) => {
    if (video) {
      video.id = videos.length + 1
      video.date = new Date()
      videos.push(video)
      resolve("success")
    } else {
      reject("failed")
    }
  })
}
module.exports.addChannel = (channel) => {
  return new Promise((resolve, reject) => {
    // if (channel) {
    //   channel.id = channels.length + 1
    //   channels.push(channel)
    //   resolve("success")
    // } else {
    //   reject("no channel data available")
    // }

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
