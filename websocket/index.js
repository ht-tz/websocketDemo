/*
 * @Author: htz
 * @Date: 2024-06-03 22:27:49
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-06-25 21:31:08
 * @Description: Ws服务端
 */
const express = require('express')
const expresws = require('express-ws')

const app = express()

// 将expres混入到app中
expresws(app)
// 建立连接服务websocket连接服务
app.get('/', (req, res, next) => {
  res.send('Hello websocket')
})

// 第一个参数服务路径，/base
// 第二个参数与前端建立连接时会调用的回调函数
//  ws相当于建立的 Websocket 实例
app.ws('/base', (ws, req) => {
  console.log('[websocket]：客官您来了~里边请')
  // 向客户发送消息
  ws.send(`[websocket]您已经连接云端!数据推送中!`)
  ws.send(`您已经链接成功`)

  // on 监听事件
  // message 事件表示从另一个方向 连接另一端客户发送的数据
  ws.on('message', (msg) => {
    console.log(msg)
    console.log('[websocket]：客官您来了~里边请')
    if (msg === 'ping') {
      ws.send('pong')
      console.log('心跳检测机制')
    }
    ws.send('发送数据')
  })

  // 设置定时器放数据
  let timer = setInterval(() => {
    ws.send('interval message' + new Date())
  }, 1500)

  // close 事件表示客户端断开链接的时候执行回调函数
  ws.on('close', () => {
    console.log('连接关闭')
    ws.send('close888888')
    clearInterval(timer)
    tiemr = null
  })
})

const port = 3005
app.listen(port, () => {
  console.log(`express server listen at http://localhost:${port}`)
})
