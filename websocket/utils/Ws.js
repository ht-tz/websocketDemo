const WebSocket = require("ws");

class Ws {
    constructor() {
        this.wss = new WebSocket.Server
        this.ws = null
    }

    init = (server) => {
        this.wss = new WebSocket.Server({
            server
        })
        this.wss.on("connection", (ws) => {
            this.ws = ws
            ws.on('message', this.onMessage)
            ws.on("error", this.onError)
            ws.on("close", this.onClose)
        })
    }

    onMessage = (msg) => {
        console.log('收到客户端消息' + msg);
        this.ws.send(222);
    }
    onError = (err) => {

    }

    onClose = ()=>{

    }
}