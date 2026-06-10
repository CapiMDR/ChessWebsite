### Configure HTTPS

This application is designed to be served over **HTTPS**. You must provide an SSL/TLS certificate and private key before starting the server.

#### Creating a Self-Signed Certificate (Development)

Create a directory for your certificates:

```bash
mkdir certs
```

Generate a self-signed certificate using OpenSSL:

```bash
openssl req -x509 -newkey rsa:4096 \
-keyout certs/private.key \
-out certs/certificate.crt \
-days 365 \
-nodes
```

During the setup process, OpenSSL will prompt for certificate information such as country, organization, and common name. For local development, the default values are usually sufficient.

Your generated files should look like:

```text
certs/
├── private.key
└── certificate.crt
```

Update the HTTPS configuration in the Node.js server to point to your certificate files:

```javascript
const httpsOptions = {
  key: fs.readFileSync("certs/private.key"),
  cert: fs.readFileSync("certs/certificate.crt"),
};
```

> **Note:** Self-signed certificates are intended for development and testing only. For production deployments, use certificates issued by a trusted Certificate Authority (CA).
