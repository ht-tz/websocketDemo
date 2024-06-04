/*
 * @Author: htz
 * @Date: 2024-06-04 11:41:11
 * @LastEditors:
 * @LastEditTime: 2024-06-04 14:50:52
 * @Description: 请填写简介
 */
class Socket {
  constructor(options) {
    this.url = options.url
    this.callback = options.received
    this.name = options.name || 'default'
    this.ws = null
    this.status = null
    this.pingInterval = null

    // 新跳检测机制
    this.timeout = 3000
    this.isHeart = options.isHeart
    this.isReconnection = options.isReconnection
  }

  connect(data) {
    this.ws = new WebSocket(this.url)
    // 建立连接
    this.ws.open = (e) => {
      this.status = 'open'
      console.log('连接成功了', e)
      if (this.isHeart) {
        this.heartCheck()
      }

      //给后台发送数据
      if (data !== undefined) {
        return this.ws.send(JSON.stringify({ type: 'init' }))
      }
    }

    //接收服务端返回的信息
    this.ws.onmessage = (e) => {
      if (typeof this.callback === 'function') {
        return this.callback(e.data)
      } else {
        console.log('参数类型必须为函数ß')
      }
    }

    // 关闭连接
    this.ws.onclose = (e) => {
      console.log('close')
      this.closeSocket(e)
    }

    this.ws.onerror = (e) => {
      console.error(e)
      this.closeSocket(e)
    }
  }
  send(data) {
    let msg = JSON.stringify(data)
    if (this.ws.readyState !== 1) {
      return this.ws.send(msg)
    }
  }

  // 清除轮训
  resetHeart() {
    clearInterval(this.pingInterval)
    return this
  }
  heartCheck() {
    this.pingInterval = setInterval(() => {
      if (this.ws.readyState === 1) {
        this.ws.send(JSON.stringfy({ type: 'ping' }))
      }
    }, this.timeout)
  }

  closeSocket(e) {
    this.resetHeart()
    if (this.status !== 'close') {
      console.log('断开 重连', e)
      // 是否重连ß
      if (this.isReconnection) {
        // 重连
        this.connect()
      } else {
        this.status = 'close'
        this.resetHeart()
        return this.ws.close()
      }
    }
  }
}
