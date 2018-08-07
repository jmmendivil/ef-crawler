// Get author and published date from urls
// save the crawler results to a file

const fs = require('fs')
const Crawler = require("crawler")
const urlsFile = './urls'
const saveFile = fs.createWriteStream('./result')
const ProgressBar = require('progress');
const c = new Crawler({
  maxConnections: 10,
  userAgent: ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'],
  callback: function (error, res, done) {
    if (error) {
      console.log(error)
    } else {
      const $ = res.$
      const href = res.request.uri.href 
      let author, published
      if (res.request.uri.host.startsWith('amp')) {
        // AMP
        const meta = $('script[type="application/json"]').eq(1).text()
        const metaJSON = JSON.parse(meta).extraUrlParams
        author = metaJSON['author']
        published = metaJSON['fecha_pub']
      } else {
        // WEBSITE
        author = $('.note-author .name').text()
        published = $('.note-date .publish').eq(0).text()
      }
      // return same order response
      // get missing params from options
      const { pageviews, browsers, views, uri } = res.options

      const response = [
        author,
        published,
        pageviews,
        browsers,
        views,
        uri
      ]
      saveFile.write(response.join('\t') + '\n')
      bar.tick({ uri })
    }
    done()
  }
})
let bar

// TODO: Use stream for bigger files
fs.readFile(urlsFile, 'utf8', function(err, data) {
  if (err) throw err;
  console.log('Read urls file >> OK');
  const urls = data
    .split('\n')
    .filter(l => l.length)
    .map(l => {
      // 6 columns
      const [ author, published, pageviews, browsers, views, uri ] = l.split('\t')
      return {
        author,
        published,
        pageviews,
        browsers,
        views,
        uri
      }
    })
  bar = new ProgressBar('Generado >> :uri\n- [:bar] - :percent :etas', { total: urls.length });
  c.queue(urls)
});
