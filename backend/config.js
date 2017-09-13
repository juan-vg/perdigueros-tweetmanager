var config = {};

config.domain = "zaratech-ptm.ddns.net";
config.url = "http://" + config.domain;

// backend server port
config.apiPort = 8888;

// backend realtime server (websocket server) port
config.wsPort = 8889;

// only insert at the start (not allowed updates if admin present)
config.adminPass = "adminpass-123";

module.exports = config;
