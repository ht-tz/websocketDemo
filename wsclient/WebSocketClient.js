/*
 * @Author: htz
 * @Date: 2024-06-03 23:14:26
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-06-03 23:50:12
 * @Description: 测试数据
 */
import { EventDispatcher } from './EventDispatcher'
export class WebSocketClient extends EventDispatcher {
  // socket链接
  socket = null
  url = ''
  // 重连次数
  reconnectAttempts = 0

  maxReconnectAttempts = 10

  // 重连时间间隔
  reconnectInterval = 1000

  //心跳间隔
  heartbeatInterval = 1000 * 30

  //计时器id
  heartbeatTimer = null

  //stopWs 彻底终止ws
  stopWs = false

  constructor() {
    super()
    this.url = url
  }

  //  lifecycle
  onopen(callback) {
    this.addEventListener('open', callback)
  }

  onmessage(callback) {
    this.addEventListener('message', callback)
  }

  onclose(callback) {
    this.addEventListener('close', callback)
  }

  onerror(callback) {
    this.addEventListener('error', callback)
  }

  // postmessage
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data)
    } else {
      console.error('[WebSocket] 未连接')
    }
  }
  //初始化连接
  connect() {
    // 重连次数为0初始化连接
    if (this.reconnectAttempts === 0) {
      this.log('WebSocket', `初始化连接中...          ${this.url}`)
    }

    //已经打开就结束
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return
    }

    // 创建socket
    this.socket = new WebSocket(this.url)

    // websocket链接成功
    this.socket.onopen = (event) => {
      this.stopWs = false
      // 重置连接成功
      this.reconnectAttempts = 0
      // 连接成功的时候停止当前心跳检测并重新启动
      this.startHeartbeat()
      this.log('WebSocket', `连接成功,等待服务端数据推送[onopen]...     ${this.url}`)
      this.dispatchEvent('open', event)
    }

    this.socket.onmessage = (event) => {
      this.dispatchEvent('message', event)
      this.startHeartbeat()
    }

    this.socket.onclose = (event) => {
      if (this.reconnectAttempts === 0) {
        this.log('WebSocket', `连接断开[onclose]...    ${this.url}`)
      }
      if (!this.stopWs) {
        this.handleReconnect()
      }
      this.dispatchEvent('close', event)
    }
    this.socket.onerror = (event) => {
      if (this.reconnectAttempts === 0) {
        this.log('WebSocket', `连接异常[onerror]...    ${this.url}`)
      }
      this.closeHeartbeat()
      this.dispatchEvent('error', event)
    }
  } // > 断网重连逻辑

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      this.log('WebSocket', `尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})       ${this.url}`)
      setTimeout(() => {
        this.connect()
      }, this.reconnectInterval)
    } else {
      this.closeHeartbeat()
      this.log('WebSocket', `最大重连失败，终止重连: ${this.url}`)
    }
  }

  //关闭连接
  close() {
    if (this.socket) {
      this.stopWs = true
      this.socket.close()
      this.socket = null
      this.removeEventListener('open')
      this.removeEventListener('message')
      this.removeEventListener('close')
      this.removeEventListener('error')
    }
    this.closeHeartbeat()
  }

  // >开始心跳检测 -> 定时发送心跳消息
  startHeartbeat() {
    if (this.stopWs) return
    if (this.heartbeatTimer) {
      this.closeHeartbeat()
    }
    this.heartbeatTimer = setInterval(() => {
      if (this.socket) {
        this.socket.send(JSON.stringify({ type: 'heartBeat', data: {} }))
        this.log('WebSocket', '送心跳数据...')
      } else {
        console.error('[WebSocket] 未连接')
      }
    }, this.heartbeatInterval)
  }
  closeHeartbeat() {
    clearInterval(this.heartbeatTimer)
    this.heartbeatTimer = undefined
  }
}
