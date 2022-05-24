const Lease = require('../models/Lease.js')

const getPromConfig = (req, res) => {
  const regex = new RegExp('^AP-.*', 'i')
  let data = Lease.getLeases()
    .then(leases =>
      leases.filter(lease => regex.test(lease['client-hostname']))
    )
    .then(leases => leases.filter(x => x['binding-state'] === 'active'))
    .then(leases => Lease.filterOldLeases(leases))
    .then(leases =>
      leases.map(x => ({
        targets: [x.ip],
        labels: {
          hostname: x['client-hostname'].toLowerCase(),
        },
      }))
    )
    .then(lease => res.json(lease))
}

module.exports = {
  getPromConfig,
}
