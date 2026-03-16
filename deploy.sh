#!/bin/bash
# TriCenter 部署脚本
# 使用方法：在服务器上执行 bash deploy.sh

set -e

echo "========== TriCenter 部署开始 =========="

# 1. 创建部署目录
echo "[1/6] 创建部署目录..."
sudo mkdir -p /opt/tricenter/frontend-dist
sudo mkdir -p /opt/tricenter/backend

# 2. 部署前端静态文件
echo "[2/6] 部署前端静态文件..."
if [ -d "frontend/dist" ]; then
    sudo cp -r frontend/dist/* /opt/tricenter/frontend-dist/
    echo "  前端文件已复制到 /opt/tricenter/frontend-dist/"
else
    echo "  警告：frontend/dist 目录不存在，请先执行前端打包"
    echo "  cd frontend && npm run build"
fi

# 3. 部署后端 JAR
echo "[3/6] 部署后端..."
JAR_FILE=$(find backend/target -name "*.jar" -not -name "*-sources.jar" 2>/dev/null | head -1)
if [ -n "$JAR_FILE" ]; then
    sudo cp "$JAR_FILE" /opt/tricenter/backend/tricenter.jar
    echo "  JAR 文件已复制到 /opt/tricenter/backend/tricenter.jar"
else
    echo "  警告：未找到 JAR 文件，请先执行后端打包"
    echo "  cd backend && mvn clean package -DskipTests"
fi

# 4. 部署 Nginx 配置
echo "[4/6] 部署 Nginx 配置..."
sudo cp nginx/czcrop.top.conf /etc/nginx/conf.d/
sudo cp nginx/api.czcrop.top.conf /etc/nginx/conf.d/
sudo nginx -t && sudo systemctl reload nginx
echo "  Nginx 配置已更新并重载"

# 5. 创建 systemd 服务
echo "[5/6] 配置 systemd 服务..."
sudo tee /etc/systemd/system/tricenter.service > /dev/null <<EOF
[Unit]
Description=TriCenter Backend Service
After=network.target mysql.service redis.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/tricenter/backend
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod -Xms256m -Xmx512m tricenter.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable tricenter
echo "  systemd 服务已配置"

# 6. 启动服务
echo "[6/6] 启动 TriCenter 后端..."
sudo systemctl restart tricenter
sleep 3
sudo systemctl status tricenter --no-pager

echo ""
echo "========== 部署完成 =========="
echo ""
echo "接下来请确认："
echo "  1. DNS 已解析 czcrop.top / www.czcrop.top / api.czcrop.top 到服务器 IP"
echo "  2. SSL 证书覆盖了这些域名（通配符证书 *.czcrop.top 或单独申请）"
echo "  3. 访问 https://czcrop.top 验证前端"
echo "  4. 访问 https://api.czcrop.top/doc.html 验证后端"
