const assert = require('assert-plus')
const fs = require('fs')

const readConfig = () => {
  const config = fs.readFileSync('/dhcpd-config/dhcpd.conf', 'utf-8')
  assert.string(config, 'config')

  const trimmedConfig = config
    .split('\n')
    .map(x => x.trim())
    .filter(x => true)
  return trimmedConfig
}

const getGlobals = async () => {
  const config = readConfig()
  let globals = {}
  for (let i = 0; i < config.length; i++) {
    let regMatch
    // If IP scobe section startes, return the globals object
    if ((regMatch = config[i].match(/^subnet ((\d{1,3}\.?){4}) netmask (\d{1,3}\.?){4}/))) return globals

    // Catch authoritative
    if ((regMatch = config[i].match(/^authoritative;/))) {
      globals.authoritative = true
    // Catch all options
    } else if ((regMatch = config[i].match(/^option (\S+)\s*(.*);/))) {
      if (!globals.options) globals.options = {}
      if (regMatch[1] === 'domain-name-servers') regMatch[2] = regMatch[2].replace(',', '').split(' ')
      globals.options[regMatch[1]] = regMatch[2]
    // Catch all "key value" lines
    } else if ((regMatch = config[i].match(/^(\w\S*) (\S+);/))) {
      globals[regMatch[1]] = regMatch[2]
    }
  }
}

const getScopes = async () => {
  const config = readConfig()
  let subnets = []
  let subnetSpecsStarted = false
  let z = -1
  for (let i = 0; i < config.length; i++) {
    let regMatch
    if ((regMatch = config[i].match(/^subnet ((\d{1,3}\.?){4}) netmask ((\d{1,3}\.?){4}) {$/))) {
      subnetSpecsStarted = true
      z++
      subnets[z] = {}
      subnets[z].ip = regMatch[1]
      subnets[z].subnet = regMatch[3]
    } else if ((regMatch = config[i].match(/^range ((\d{1,3}\.?){4}) ((\d{1,3}\.?){4})/)) && subnetSpecsStarted) {
      subnets[z].range = { start: regMatch[1], end: regMatch[3] }
    } else if ((regMatch = config[i].match(/^option (\S+)\s*(.*);/)) && subnetSpecsStarted) {
      if (!subnets[z].options) subnets[z].options = {}
      if (regMatch[1] === 'domain-name-servers') regMatch[2] = regMatch[2].replace(',', '').split(' ')
      subnets[z].options[regMatch[1]] = regMatch[2]
    } else if ((regMatch = config[i].match(/^(\w\S*) (\S+);/)) && subnetSpecsStarted) {
      subnets[z][regMatch[1]] = regMatch[2]
    }
  }
  return subnets
}

module.exports = {
  getGlobals,
  getScopes
}
