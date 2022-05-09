module.exports = {
    apps: [{
        name: "Progress Tracker",
        script: "./dist/index.js",
        node_args: "-r dotenv/config",
        env: {
            NODE_ENV: "production",
        },
        args: [
            "--color"
        ]
    }]
}