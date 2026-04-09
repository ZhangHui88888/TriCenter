#!/bin/bash
set -e
cd /tmp

# Download USERTrust RSA cross-signed by AAA Certificate Services
curl -so usertrust_cross.crt 'https://crt.comodoca.com/USERTrustRSAAAACA.crt'

# Convert DER to PEM
openssl x509 -inform DER -in usertrust_cross.crt -outform PEM -out usertrust_cross.pem 2>/dev/null || cp usertrust_cross.crt usertrust_cross.pem

echo "=== USERTrust cross-signed cert ==="
openssl x509 -in usertrust_cross.pem -noout -issuer -subject

# Get current server cert and intermediate
CERT_DIR=/root/.acme.sh/czcrop.top
echo "=== Server cert ==="
openssl x509 -in $CERT_DIR/czcrop.top.cer -noout -issuer -subject
echo "=== Intermediate CA ==="
openssl x509 -in $CERT_DIR/ca.cer -noout -issuer -subject

# Build new fullchain: server cert + ZeroSSL intermediate + USERTrust cross-sign
cat $CERT_DIR/czcrop.top.cer $CERT_DIR/ca.cer usertrust_cross.pem > /tmp/new_fullchain.pem

echo "=== Chain cert count ==="
grep -c 'BEGIN CERTIFICATE' /tmp/new_fullchain.pem

# Install to nginx cert path
cp /tmp/new_fullchain.pem /etc/letsencrypt/live/czcrop.top/fullchain.pem
echo "=== Fullchain installed ==="

# Start nginx
systemctl start nginx 2>/dev/null || systemctl reload nginx 2>/dev/null || true

# Verify
echo "=== Verify chain served by nginx ==="
sleep 1
openssl s_client -connect 127.0.0.1:443 -servername czcrop.top </dev/null 2>&1 | grep -E 'depth|Verify'

echo "DONE"
