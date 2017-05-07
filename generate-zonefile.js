const fs = require('fs')
const publicIp = require('public-ip')
const ipv6calc = require('ipv6calc')
const zonefile = require('dns-zonefile')

const templateFile = process.argv[2]
const zoneFile = process.argv[3]
if (!templateFile || !zoneFile) {
  console.error('Usage: generate-zonefile.js template.json template.zone')
  process.exit(1)
}

;(async () => {
  const ipv4 = await publicIp.v4()
  const ipv6 = await publicIp.v6()
  const ipv6net = ipv6calc.fromIPv6(ipv6).net
  
  const data = fs.readFileSync(templateFile, 'utf-8')
                 .replace(/<ipv4>/g, ipv4)
                 .replace(/<ipv6>/g, ipv6)
                 .replace(/<ipv6prefix>/g, ipv6net.substring(0, ipv6net.length-2))
                     
  const zoneData = zonefile.generate(JSON.parse(data))                 
  fs.writeFileSync(zoneFile, zoneData, 'utf-8')
})()