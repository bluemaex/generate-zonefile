const fs = require('fs')
const path = require('path')
const publicIp = require('public-ip')
const ipv6calc = require('ipv6calc')
const zonefile = require('dns-zonefile')

const templateDir = process.argv[2]
if (!templateDir) {
  console.error('Usage: generate-zonefile.js template-dir')
  process.exit(1)
}

;(async () => {
  const ipv4 = await publicIp.v4()
  const ipv6 = await publicIp.v6()
  const ipv6net = ipv6calc.fromIPv6(ipv6).net
  
  fs.readdirSync(templateDir)
    .filter(file => fs.statSync(file).isFile() && file.match(/^(?!(package)).*json$/))
    .forEach(file => {
      const inFile = path.join(templateDir, file)
      
      const data = fs.readFileSync(inFile, 'utf-8')
                     .replace(/<ipv4>/g, ipv4)
                     .replace(/<ipv6>/g, ipv6)
                     .replace(/<ipv6prefix>/g, ipv6net.substring(0, ipv6net.length-2))
                     
      const outFile = inFile.replace('.json', '.forward')
      fs.writeFileSync(outFile, zonefile.generate(JSON.parse(data)), 'utf-8')
    })
})()
