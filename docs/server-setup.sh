#!/bin/bash
# 服务器初始化脚本
# 在服务器上执行: bash server-setup.sh

set -e

echo "🚀 开始服务器初始化..."

# 1. 更新系统
echo "📦 更新系统包..."
apt-get update
apt-get upgrade -y

# 2. 安装 Node.js 20
echo "📦 安装 Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "Node.js 版本: $(node -v)"
echo "npm 版本: $(npm -v)"

# 3. 安装 PM2
echo "📦 安装 PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
fi
echo "PM2 版本: $(pm2 -v)"

# 4. 安装 Nginx
echo "📦 安装 Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl enable nginx
    systemctl start nginx
fi
echo "Nginx 版本: $(nginx -v 2>&1)"

# 5. 创建项目目录
echo "📁 创建项目目录..."
mkdir -p /var/www
mkdir -p /var/log/pm2

# 6. 克隆项目（如果不存在）
PROJECT_DIR="/var/www/three-game"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "📥 克隆项目..."
    cd /var/www
    git clone https://github.com/guoruncheng-web/three-game-box.git three-game
    cd $PROJECT_DIR
    npm install
    npm run build
else
    echo "✅ 项目目录已存在"
fi

# 7. 配置 Nginx
echo "⚙️ 配置 Nginx..."
NGINX_CONFIG="/etc/nginx/sites-available/gamebox"
if [ ! -f "$NGINX_CONFIG" ]; then
    cat > $NGINX_CONFIG << 'EOF'
server {
    listen 80;
    server_name www.gamebox.xingzdh.com gamebox.xingzdh.com;

    access_log /var/log/nginx/gamebox-access.log;
    error_log /var/log/nginx/gamebox-error.log;
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:7006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;
}
EOF

    # 创建软链接
    ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/gamebox
    
    # 测试配置
    nginx -t
    
    # 重载 Nginx
    systemctl reload nginx
    echo "✅ Nginx 配置完成"
else
    echo "✅ Nginx 配置已存在"
fi

# 8. 启动应用
echo "🚀 启动应用..."
cd $PROJECT_DIR
if pm2 list | grep -q "three-game"; then
    pm2 reload ecosystem.config.js --only three-game
else
    pm2 start ecosystem.config.js
    pm2 save
fi

echo "✅ 服务器初始化完成！"
echo ""
echo "📊 应用状态:"
pm2 status
echo ""
echo "🌐 访问地址: http://www.gamebox.xingzdh.com"
