#!/usr/bin/env bash
# Atomic TriCenter deployment. It never removes old releases or rolls back database migrations.
set -Eeuo pipefail

APP_ROOT=/opt/tricenter
RELEASES_DIR="$APP_ROOT/releases"
CURRENT_LINK="$APP_ROOT/current"
SHARED_DIR=/var/lib/tricenter
BACKUP_DIR=/var/backups/tricenter
ENV_FILE=/etc/tricenter/tricenter.env
MYSQL_BACKUP_CONFIG=/etc/tricenter/mysql-backup.cnf
VERSION=${VERSION:-$(date -u +%Y%m%dT%H%M%SZ)}
RELEASE_DIR="$RELEASES_DIR/$VERSION"
READINESS_URL=http://127.0.0.1:8082/actuator/health/readiness

JAR_FILE=$(find backend/target -maxdepth 1 -name 'tricenter-backend-*.jar' -not -name '*.original' -print -quit)
if [[ -z "$JAR_FILE" || ! -d frontend/dist ]]; then
  echo "Missing build artifacts. Run backend/./mvnw clean verify and frontend/npm ci && npm run build first." >&2
  exit 1
fi
if [[ ! -f "$ENV_FILE" || ! -f "$MYSQL_BACKUP_CONFIG" ]]; then
  echo "Create $ENV_FILE and $MYSQL_BACKUP_CONFIG from deploy/*.example before deployment." >&2
  exit 1
fi

sudo stat -c '%a' "$ENV_FILE" "$MYSQL_BACKUP_CONFIG" | while read -r mode; do
  [[ "$mode" == "600" ]] || { echo "Environment and backup config files must have mode 600." >&2; exit 1; }
done

if ! id -u tricenter >/dev/null 2>&1; then
  sudo useradd --system --home "$APP_ROOT" --shell /usr/sbin/nologin tricenter
fi
sudo install -d -o tricenter -g tricenter "$RELEASES_DIR" "$SHARED_DIR/uploads" "$SHARED_DIR/quarantine" /var/log/tricenter
sudo install -d -m 700 "$BACKUP_DIR"

echo "[1/6] Backing up database and persistent attachments"
BACKUP_STAMP=$(date -u +%Y%m%dT%H%M%SZ)
sudo mysqldump --defaults-extra-file="$MYSQL_BACKUP_CONFIG" \
  --single-transaction --routines --triggers --events tricenter \
  | gzip | sudo tee "$BACKUP_DIR/tricenter-$BACKUP_STAMP.sql.gz" >/dev/null
sudo tar -C "$SHARED_DIR" -czf "$BACKUP_DIR/uploads-$BACKUP_STAMP.tar.gz" uploads

echo "[2/6] Staging immutable release $VERSION"
sudo install -d -o tricenter -g tricenter "$RELEASE_DIR/backend" "$RELEASE_DIR/frontend"
sudo install -o tricenter -g tricenter -m 0440 "$JAR_FILE" "$RELEASE_DIR/backend/tricenter.jar"
sudo cp -a frontend/dist/. "$RELEASE_DIR/frontend/"
sudo chown -R tricenter:tricenter "$RELEASE_DIR"
(cd "$RELEASE_DIR" && sha256sum backend/tricenter.jar $(find frontend -type f -print | sort)) \
  | sudo tee "$RELEASE_DIR/SHA256SUMS" >/dev/null
(cd "$RELEASE_DIR" && sha256sum --check SHA256SUMS)

echo "[3/6] Installing hardened service and Nginx configuration"
sudo install -m 0644 deploy/tricenter.service /etc/systemd/system/tricenter.service
sudo install -m 0644 nginx/czcrop.top.conf /etc/nginx/conf.d/czcrop.top.conf
sudo install -m 0644 nginx/api.czcrop.top.conf /etc/nginx/conf.d/api.czcrop.top.conf
sudo nginx -t
sudo systemctl daemon-reload
sudo systemctl enable tricenter

echo "[4/6] Switching current release atomically"
PREVIOUS_RELEASE=$(readlink -f "$CURRENT_LINK" 2>/dev/null || true)
sudo ln -sfn "$RELEASE_DIR" "$APP_ROOT/current.next"
sudo mv -Tf "$APP_ROOT/current.next" "$CURRENT_LINK"

echo "[5/6] Starting service and checking readiness"
sudo systemctl restart tricenter
READY=false
for _ in $(seq 1 30); do
  if curl --fail --silent "$READINESS_URL" >/dev/null; then READY=true; break; fi
  sleep 2
done

if [[ "$READY" != true ]]; then
  echo "Readiness failed; restoring previous application symlink." >&2
  if [[ -n "$PREVIOUS_RELEASE" && -d "$PREVIOUS_RELEASE" ]]; then
    sudo ln -sfn "$PREVIOUS_RELEASE" "$APP_ROOT/current.next"
    sudo mv -Tf "$APP_ROOT/current.next" "$CURRENT_LINK"
    sudo systemctl restart tricenter
  fi
  sudo journalctl -u tricenter -n 100 --no-pager >&2
  exit 1
fi

echo "[6/6] Reloading Nginx"
sudo systemctl reload nginx
echo "TriCenter release $VERSION is ready. Previous releases and backups were retained."
