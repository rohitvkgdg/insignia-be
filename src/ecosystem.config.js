module.exports = {
  apps: [{
    name: "insignia-backend",
    script: "bun",
    args: "dist/index.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    error_file: "logs/pm2-error.log",
    out_file: "logs/pm2-output.log",
    time: true,
  }]
};