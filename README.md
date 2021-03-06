# isc-dhcp-api
Express API that exposes config and lease information from ISC DHCP.

Note: Your global configuration **must** before your scopes. Or else the API will not pick them up.

## Docker
Note the folders containing the config and leases files are mounted instead of the files themself. I've experienced that if the files is mounted directly in the container, they will not update when new data is appended to the files on the host.
```
docker run \
  --name isc-dhcp-api \
  --restart unless-stopped \
  -p 3000:3000 \
  -e token="your-token-here" \
  -v /etc/dhcp/:/dhcpd-config/ \
  -v /var/lib/dhcp/:/dhcpd-leases/ \
  -d kerwood/isc-dhcp-api
```
Or use the included `docker-compose.yml` file.

## Authorization
Add your token to the Authorization header of your request or remove the `token` environment variable to disable authentication.
```
curl -H "Authorization: your-token-here" http://localhost:3000/config
```

## Endpoints
### Get config
Get the DHCP config. Global configuration and scopes.
```
[GET] /config
```
```
{
  "authoritative":true,
  "default-lease-time":"600",
  "max-lease-time":"7200",
  "options":{
    "domain-name":"\"example.org\"",
    "domain-name-servers":[
      "8.8.8.8",
      "8.8.4.4"
    ]
  },
  "scopes":[
    {
      "ip":"10.0.0.0",
      "subnet":"255.255.255.0",
      "range":{
        "start":"10.0.0.2",
        "end":"10.0.0.253"
      },
      "options":{
        "subnet-mask":"255.255.255.0",
        "broadcast-address":"10.0.0.255",
        "routers":"10.0.0.1"
      }
    },
    {
      "ip":"10.1.0.0",
      "subnet":"255.255.255.0",
      "range":{
        "start":"10.1.0.2",
        "end":"10.1.0.253"
      },
      "options":{
        "subnet-mask":"255.255.255.0",
        "broadcast-address":"10.1.0.255",
        "routers":"10.1.0.1"
      }
    }
  ]
}
```
### Get Globals
Get the DHCP global configuration.
```
[GET] /config/globals
```
```
{
  "authoritative":true,
  "default-lease-time":"600",
  "max-lease-time":"7200",
  "options":{
    "domain-name":"\"example.org\"",
    "domain-name-servers":[
      "8.8.8.8",
      "8.8.4.4"
    ]
  }
}
```
### Get DHCP Scopes
```
[GET] /config/scopes
```
```
[
  {
    "ip":"10.0.0.0",
    "subnet":"255.255.255.0",
    "range":{
      "start":"10.0.0.2",
      "end":"10.0.0.253"
    },
    "options":{
      "subnet-mask":"255.255.255.0",
      "broadcast-address":"10.0.0.255",
      "routers":"10.0.0.1"
    }
  },
  {
    "ip":"10.1.0.0",
    "subnet":"255.255.255.0",
    "range":{
      "start":"10.1.0.2",
      "end":"10.1.0.253"
    },
    "options":{
      "subnet-mask":"255.255.255.0",
      "broadcast-address":"10.1.0.255",
      "routers":"10.1.0.1"
    }
  }
]
```
### Get all leases
```
[GET] /leases
```
```
[
  {
    "ip":"10.0.0.14",
    "starts":"2019-02-10T17:52:39.000Z",
    "ends":"2019-02-10T18:02:39.000Z",
    "cltt":"2019-02-10T17:52:39.000Z",
    "binding state":"active",
    "next binding state":"free",
    "rewind binding state":"free",
    "hardware ethernet":"00:02:d1:1b:af:d3",
    client-hostname: "Trainy-McTrainface"
  },
  {
    "ip":"10.1.0.31",
    "starts":"2019-02-10T17:59:31.000Z",
    "ends":"2019-02-10T18:09:31.000Z",
    "cltt":"2019-02-10T17:59:31.000Z",
    "binding state":"active",
    "next binding state":"free",
    "rewind binding state":"free",
    "hardware ethernet":"00:02:d1:94:d4:f6",
    client-hostname: "Poohs-PC"
  },
  .....
]
```
### Get all active leases for specific IP
```
[GET] /leases/10.1.0.31
```
```
[
  {
    "ip":"10.1.0.31",
    "starts":"2019-02-10T17:59:31.000Z",
    "ends":"2019-02-10T18:09:31.000Z",
    "cltt":"2019-02-10T17:59:31.000Z",
    "binding state":"active",
    "next binding state":"free",
    "rewind binding state":"free",
    "hardware ethernet":"00:02:d1:94:d4:f6",
    client-hostname: "Poohs-PC"
  },
  .....
]
```
### Get all active leases in subnet
The subnet does not have to match a DHCP scope. it can be any subnet.
```
[GET] /leases/10.1.0.31/24
```
```
[
  {
    "ip":"10.1.0.9",
    "starts":"2019-02-10T17:52:39.000Z",
    "ends":"2019-02-10T18:02:39.000Z",
    "cltt":"2019-02-10T17:52:39.000Z",
    "binding state":"active",
    "next binding state":"free",
    "rewind binding state":"free",
    "hardware ethernet":"00:02:d1:f3:ff:82",
    client-hostname: "Flubber"
  },
  {
    "ip":"10.1.0.31",
    "starts":"2019-02-10T17:59:31.000Z",
    "ends":"2019-02-10T18:09:31.000Z",
    "cltt":"2019-02-10T17:59:31.000Z",
    "binding state":"active",
    "next binding state":"free",
    "rewind binding state":"free",
    "hardware ethernet":"00:02:d1:94:d4:f6",
    client-hostname: "Poohs-PC"
  },
  .....
]
```
### Search for leases
The search function will search in `client-hostname`, `hardware ethernet` and `set vendor-class-identifier` properties.
```
[GET] /leases/search/flubber
```
```
[
  {
    "ip":"10.1.0.9",
    "starts":"2019-02-10T17:52:39.000Z",
    "ends":"2019-02-10T18:02:39.000Z",
    "cltt":"2019-02-10T17:52:39.000Z",
    "binding state":"active",
    "next binding state":"free",
    "rewind binding state":"free",
    "hardware ethernet":"00:02:d1:f3:ff:82",
    client-hostname: "Flubber"
  }
]
```
