const fs = require('fs')
const Crawler = require("crawler")

const file = fs.createWriteStream('./result.csv')
const c = new Crawler({
  maxConnections: 10,
  callback: function (error, res, done) {
    if (error) {
      console.log(error)
    } else {
      const $ = res.$
      const author = $('.note-author .name').text()
      const published = $('.note-date .publish').eq(0).text()
      const href = res.request.uri.href 
      file.write(author + '\t' + published + '\t' + href + '\n')
    }
    done()
  }
})

c.queue([ ])
