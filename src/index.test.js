/**
 * This file is to test if the code builds with travis
 */

const express = require('express')
const https = require('https')
const app = express()
const fs = require('fs')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const safeCompare = require('safe-compare')
const xss = require('xss-clean')

/* Configure our rest client */
const client = {
  mongoose: require('mongoose'),
  apiSettings: require('./settings/api_settings.json')
}
app.use(rateLimit(client.apiSettings.rate_limiter)) // appies to all request
app.use(helmet())
app.use(xss())
app.set('trust proxy', 1)

/* Custom middleware to check if a secretKey exist and if so make sure header has it to proceed */
app.use('/', (req, res, next) => {
  if (client.apiSettings.api.secretKey !== '') {
    if (safeCompare(req.header('secretKey'), client.apiSettings.api.secretKey)) next()
    else return res.send('You are unable to access this api.')
  } else next()
})

/* Require our engines/libs and pass our client */
require('./library/database.js')(client)
require('./library/engine.js')(client)

/* Require our models */
require('./models/user.model.js')(client)

/* Routing */
app.use('/', require('./routes/index.js'))

/* Listen on https only */
https.createServer({
  key: fs.readFileSync('./src/settings/server.key', 'utf8'),
  cert: fs.readFileSync('./src/settings/server.cert', 'utf8')
}, app)
  .listen(client.apiSettings.api.port, function () {
    process.exit(0)
  })
