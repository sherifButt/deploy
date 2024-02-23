const express = require('express');
const { exec } = require('child_process');
const axios = require('axios');
require('dotenv').config();


const app = express();
app.use(express.json());
const ALLOWED_CONTAINERS_COUNT = process.env.ALLOWED_CONTAINERS_COUNT || 5;
const APP_CONTAINER_NAME = process.env.APP_CONTAINER_NAME || "anythingllm";
const SERVER_PORT = process.env.SERVER_PORT || 3000;

// Digital Ocean API client configuration
// const api = axios.create({
//   baseURL: 'https://api.digitalocean.com/v2/',
//   headers: { Authorization: `Bearer ${process.env.DIGITAL_OCEAN_TOKEN}` },
// });

app.post('/deploy', async (req, res) => {
  let { companyName } = req.body;
  if (!companyName) {
    return res.status(400).json({ error: 'Company name is required.' });
  }

  // Sanitize the company name
  companyName = sanitizeCompanyName(companyName);
  if (!companyName) {
    return res.status(400).json({ error: 'Invalid company name.' });
  }

  const subdomain = `${companyName}-${Date.now()}`;
  const domain = process.env.DOMAIN; // Your domain managed by Digital Ocean
  const fullDomain = `${subdomain}.${domain}`;

  try {
    const getPort = (await import('get-port')).default;
    const port = await getPort();

    // try {
    //   // Create DNS record for the subdomain
    //   await api.post(`domains/${domain}/records`, {
    //     type: 'A',
    //     name: subdomain,
    //     data: process.env.DROPLET_IP, // IP address of your Digital Ocean Droplet
    //     ttl: 3600,
    //   });
    // } catch (apiError) {
    //   console.error(`Digital Ocean API error: ${apiError}`);
    //   return res.status(500).json({ error: 'Failed to create DNS record.' });
    // }

    // get this server's IP address
    const ip = await axios.get('https://api.ipify.org?format=json');

    // check how many containers are running
    let containerCount = 0;
    exec('docker ps -q | wc -l', (error, stdout, stderr) => {
      if (error) {
          console.error(`exec error: ${error}`);
          return res.status(500).json({ error: 'Failed to retrieve container count' });
      }
       containerCount = parseInt(stdout.trim(), 10);
      if (containerCount >= ALLOWED_CONTAINERS_COUNT) {
          return res.status(400).json({ error: `Too many containers running [${containerCount}/${ALLOWED_CONTAINERS_COUNT}]` });
      }
  });
    
    // Place the Docker deployment command here
    const storageLocation = `./${APP_CONTAINER_NAME}/${companyName}`;
    const dockerCommand = `
    export STORAGE_LOCATION="${storageLocation}" && \
    mkdir -p $STORAGE_LOCATION && \
    cp -r "./${APP_CONTAINER_NAME}/default/." "$STORAGE_LOCATION/" && \
    docker run -d -p ${port}:3001 \
    --cap-add SYS_ADMIN \
    --restart=always \
    --name ${companyName} \
    -v ${storageLocation}:/app/server/storage \
    -v ${storageLocation}/.env:/app/server/.env \
    -e STORAGE_DIR="/app/server/storage" \
    ${process.env.APP_IMAGE_NAME}`;

    exec(dockerCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).json({ error: `Deployment failed [${error}]` });
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      // Respond only after the exec command completes
      res.json({ message: 'Deployment succeeded', port: port, subdomain: fullDomain, ip: `http://${ip.data.ip}:${port}` ,containerCount: `[${containerCount}/${ALLOWED_CONTAINERS_COUNT}]`});
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(SERVER_PORT, () => {
  console.log(`Server listening at http://localhost:${SERVER_PORT}`);
});

function sanitizeCompanyName(companyName) {
  // Sanitize to allow alphanumeric, hyphens, and underscores
  return companyName.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
}

