const express = require('express');
const { exec } = require('child_process');
const axios = require('axios');
require('dotenv').config();


const app = express();
app.use(express.json());

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

    // Place the Docker deployment command here
    const storageLocation = `./${process.env.APP_CONTAINER_NAME}/${companyName}`;
    const dockerCommand = `
    export STORAGE_LOCATION="${storageLocation}" && \
    mkdir -p $STORAGE_LOCATION && \
    touch "$STORAGE_LOCATION/.env" && \
    cp -r "./${process.env.APP_CONTAINER_NAME}/default/." "$STORAGE_LOCATION/"`
    //&& docker run -d -p ${port}:${port} --cap-add SYS_ADMIN --restart=always -v ${storageLocation}:/app/server/storage -v ${storageLocation}/.env:/app/server/.env -e STORAGE_DIR="/app/server/storage" ${process.env.APP_IMAGE_NAME}`;

    exec(dockerCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).json({ error: 'Deployment failed' });
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      // Respond only after the exec command completes
      res.json({ message: 'Deployment succeeded', port: port, subdomain: fullDomain });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const serverPort = process.env.SERVER_PORT || 3000;
app.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

function sanitizeCompanyName(companyName) {
  // Sanitize to allow alphanumeric, hyphens, and underscores
  return companyName.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
}