const fs = require("fs")
let videos = []
let channels = []

module.exports.initialize = () => {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/videos.json", "utf-8", (err, data) => {
      if (err) {
        reject(`ERR: ${err}`)
      }
      videos = JSON.parse(data)

      fs.readFile("./data/channels.json", "utf-8", (err, data) => {
        if (err) {
          reject(`ERR: ${err}`)
        }
        channels = JSON.parse(data)
        resolve("success")
      })
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
    if (channels.length == 0) {
      reject("no videos found!")
    }
    resolve(channels)
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
    if (channel) {
      channel.id = channels.length + 1
      channels.push(channel)
      resolve("success")
    } else {
      reject("no channel data available")
    }
  })
}
