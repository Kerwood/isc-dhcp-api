const assert = require('assert-plus')
const fs = require('fs')

const readLeases = () => {
  const leases = fs.readFileSync('/dhcpd-leases/dhcpd.leases', 'utf-8')
  assert.string(leases, 'leases')

  const trimmedLeases = leases
    .split('\n')
    .filter(x => true)
  return trimmedLeases
}

const getLeases = async () => {
  const leasesFile = readLeases()
  let leases = []

  let z = -1
  for (let i = 0; i < leasesFile.length; i++) {
    let regMatch
    if ((regMatch = leasesFile[i].match(/^lease (.*) {$/))) {
      z++
      leases[z] = {}
      leases[z].ip = regMatch[1]
    } else if ((regMatch = leasesFile[i].match(/^\s{2}(starts|ends|cltt|atsfp|tstp|tsfp) \d+ (.*);$/))) {
      // starts, ends, cltt, etc. dates
      leases[z][regMatch[1]] = new Date(regMatch[2] + ' UTC')
    } else if ((regMatch = leasesFile[i].match(/^\s{2}([a-zA-Z0-9 -]+) ([^"].*);$/))) {
      // misc.
      leases[z][regMatch[1]] = regMatch[2]
    } else if ((regMatch = leasesFile[i].match(/^\s{2}([a-zA-Z0-9 -]+) "(.*)";$/))) {
      // client-hostname, uid
      leases[z][regMatch[1]] = regMatch[2]
    }
  }

  return leases
}

const filterOldLeases = (leases) => {
  return leases.reduce((array, lease) => {
    const i = array.findIndex(x => x['hardware ethernet'] === lease['hardware ethernet'])
    if (i === -1) {
      array.push(lease)
    } else if (new Date(lease.ends) > new Date(array[i].ends)) {
      array[i] = lease
    }
    return array
  }, [])
}

module.exports = {
  getLeases: getLeases,
  filterOldLeases: filterOldLeases
}
