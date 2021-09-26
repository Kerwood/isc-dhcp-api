const express = require('express')
const Config = require('./controllers/ConfigController.js')
const Lease = require('./controllers/LeaseController.js')
const app = express()
const leasesRoute = express.Router()
const configRoute = express.Router()
const morgan = require('morgan')

app.use(morgan('combined'))

app.get('/', (req, res) => {
  res.json({ name: 'isc-dhcp-lease-api', description: 'API that exposes lease information from ISC DHCP', version: '2.0.0' })
})

app.use((req, res, next) => {
  if (process.env.token && process.env.token !== req.headers.authorization) {
    res.status(401).json({ error: 'Not authorized' }).end()
    return next('Unauthorized')
  }
  next()
})

/* ###################################################
#                    Leases Routes                   #
################################################### */
app.use('/leases', leasesRoute)

leasesRoute
  .get('/', Lease.getLeases)
  .get('/:ip(\\d{1,3}.\\d{1,3}.\\d{1,3}.\\d{1,3})', Lease.getLeaseByIP)
  .get('/:ip(\\d{1,3}.\\d{1,3}.\\d{1,3}.\\d{1,3})/:prefix(\\d+)', Lease.getLeasesByScope)
  .get('/search/:string', Lease.searchLeases)

/* ###################################################
#                    Config Routes                   #
################################################### */
app.use('/config', configRoute)

configRoute
  .get('/', Config.getConfig)
  .get('/scopes', Config.getScopes)
  .get('/globals', Config.getGlobals)

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
