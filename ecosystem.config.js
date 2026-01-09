/**
 * PM2 进程管理配置
 */

module.exports = {
  apps: [
    {
      name: 'three-game',
      script: 'node_modules/.bin/next',
      args: 'start --port 7006',
      cwd: '/var/www/three-game',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 7006,
      },
      error_file: '/var/log/pm2/three-game-error.log',
      out_file: '/var/log/pm2/three-game-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', '.next', 'logs'],
    },
  ],
};
