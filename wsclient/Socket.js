/*
 * @Author: htz
 * @Date: 2024-06-04 11:41:11
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-06-25 22:29:40
 * @Description:  客户端webosocket
 */
class Socket {
  constructor(options) {
    this.url = options.url
    this.callback = options.received
    this.name = options.name || 'default'
    this.ws = null
    this.status = null
    this.pingInterval = null

    //重试机制
    this.reAttempts = options.reAttempts || 0

    this.maxAttempts = 10

    this.reconnectionInterval = options.reconnectionInterval || 1500

    //心跳检测机制
    this.timeout = options.timoout || 3000
    this.isHeart = options.isHeart || false
    this.isReconnection = options.isReconnection
  }

  connect(data) {
    // 重新链接次数为0，进行链接初始化
    if (this.reAttempts === 0) {
      console.log('WebSocket', `初始化连接中...          ${this.url}`)
    }

    // 链接已经打开就结束
    if (this.ws && this.ws.readyState === 1) {
      return
    }

    this.ws = new WebSocket(this.url)
    // 建立连接 后触发
    this.ws.onopen = (e) => {
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
        console.log(e.data)
        return this.callback(e.data)
      } else {
        console.log('参数类型必须为函数ß')
      }
    }

    // 服务器关闭链接， 就关闭客户端连接
    this.ws.onclose = (e) => {
      if (this.reAttempts === 0) {
        this.log('WebSocket', `连接断开[onclose]...    ${this.url}`)
      }
      this.status = 'close'
      console.log('close')
      this.closeSocket(e)
    }

    // 出现错误的时候主动关闭浏览器
    this.ws.onerror = (e) => {
      if (this.reAttempts === 0) {
        console.log('WebSocket', `连接断开[onclose]...    ${this.url}`)
      }

      console.error(e)
      this.closeSocket(e)
    }
  }
  //给后端发送数据
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
  /**
   * 心跳检测机制
   */
  heartCheck() {
    this.pingInterval = setInterval(() => {
      if (this.ws.readyState === 1) {
        // 定时向服务器发送版消息
        this.ws.send('ping')
      }
    }, this.timeout)
  }

  // 重连判断
  handleConnetion() {
    if (this.reAttempts < this.maxAttempts) {
      this.reAttempts++
      console.log('WebSocket', `连接断开[onclose]...  重试${this.reAttempts} / ${this.maxAttempts}  ${this.url}`)

      setTimeout(() => {
        this.connect()
      }, this.reconnectionInterval)
    } else {
      this.status = 'close'
      this.closeSocket()
      console.log('WebSocket', `最大重连失败，终止重连: ${this.url}`)
    }
  }

  closeSocket(data) {
    this.resetHeart()
    if (this.status !== 'close') {
      console.log('断开 重连', data)
      // 是否重连ß
      if (this.isReconnection) {
        // 重连
        // this.connect()
        this.handleConnetion()
      } else {
        this.status = 'close'
        this.resetHeart()
        // 客户端主动关闭链接方法
        return this.ws.close()
      }
    }
  }
}
