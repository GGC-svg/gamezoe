module.exports = {
    apps: [
        {
            name: "gamezoe-web",
            script: "./server/index.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: "production",
                PORT: 3000
            }
        },
        {
            name: "gamezoe-fish-server",
            script: "./server/fish_mocker.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};
