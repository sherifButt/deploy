const express = require('express');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

app.post('/deploy', (req, res) => { 
  const { companyName } = req.body;
  const storageLocation = `/path/to/storage/${companyName}`;
  const dockerCommand = `export STORAGE_LOCATION=${storageLocation} && mkdir -p $STORAGE_LOCATION && touch "$STORAGE_LOCATION/.env" && chown -R 1000:1000 $STORAGE_LOCATION && docker run -d -p 3001:3001 --cap-add SYS_ADMIN --restart=always -v ${storageLocation}:/app/server/storage -v ${storageLocation}/.env:/app/server/.env -e STORAGE_DIR="/app/server/storage" mintplexlabs/anythingllm:master`;

  exec(dockerCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Deployment failed' });
    }
    console.log(`stdout: ${stdout}`)
    console.error(`stderr: ${stderr}`);
    res.json({ message: 'Deployment succeeded', port: 3001 });
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
