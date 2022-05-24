const Config = require('../models/Config.js')

const getConfig = (req, res) => {
  Promise.all([Config.getScopes(), Config.getGlobals()]).then(data =>
    res.json({ ...data[1], scopes: data[0] })
  )
}

const getScopes = (req, res) => {
  Config.getScopes().then(data => res.json(data))
}

const getGlobals = (req, res) => {
  Config.getGlobals().then(data => res.json(data))
}

module.exports = {
  getConfig,
  getScopes,
  getGlobals,
}
