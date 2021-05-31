const Lease = require('../models/Lease.js')
const IpSubnetCalculator = require('ip-subnet-calculator')
const CIDRMatcher = require('cidr-matcher')

const getLeases = (req, res) => {
  Lease.getLeases()
    .then(leases => leases.filter(x => x['binding-state'] === 'active'))
    .then(leases => Lease.filterOldLeases(leases))
    .then(data => res.json(data))
}

const getLeaseByIP = (req, res) => {
  const ip = req.params.ip
  if (!IpSubnetCalculator.isIp(ip)) return res.status(400).json({ success: false, msg: 'Not a valid IP address!' })
  Lease.getLeases()
    .then(leases => leases.filter(x => x.ip === ip))
    .then(leases => Lease.filterOldLeases(leases))
    .then(lease => res.json(lease))
}

const getLeasesByScope = (req, res) => {
  const { ip, prefix } = req.params
  const matcher = new CIDRMatcher([`${ip}/${prefix}`])
  if (!IpSubnetCalculator.isIp(ip)) return res.status(400).json({ success: false, msg: 'Not a valid IP address!' })
  if (req.params.prefix < 1 || prefix > 32) return res.status(400).json({ success: false, msg: 'Not a valid prefix!!' })
  Lease.getLeases()
    .then(leases => leases.filter(x => matcher.contains(x.ip)))
    .then(leases => leases.filter(x => x['binding-state'] === 'active'))
    .then(leases => Lease.filterOldLeases(leases))
    .then(lease => res.json(lease))
}

const searchLeases = (req, res) => {
  const regex = new RegExp(`.*${req.params.string}.*`, 'i')
  Lease.getLeases()
    .then(leases => leases
      .filter(lease =>
        regex.test(lease['client-hostname']) ||
        regex.test(lease['hardware-ethernet']) ||
        regex.test(lease['set-vendor-class-identifier'])
      ))
    .then(leases => leases.filter(x => x['binding-state'] === 'active'))
    .then(leases => Lease.filterOldLeases(leases))
    .then(lease => res.json(lease))
}

module.exports = {
  getLeases,
  getLeaseByIP,
  getLeasesByScope,
  searchLeases
}
