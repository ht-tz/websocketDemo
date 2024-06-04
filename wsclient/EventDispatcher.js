/*
 * @Author: htz
 * @Date: 2024-06-03 23:03:57
 * @LastEditors:
 * @LastEditTime: 2024-06-03 23:50:57
 * @Description: 事件分发类
 */
class Log {
  static console = true
  log(title, text) {
    if (!Log.console) return
    if (import.meta.env.MODE === 'production') return
    const color = '#ff4d4f'
    console.log(
      `%c ${title} %c ${text} %c`,
      `background:${color};border:1px solid ${color}; padding: 1px; border-radius: 2px 0 0 2px; color: #fff;`,
      `border:1px solid ${color}; padding: 1px; border-radius: 0 2px 2px 0; color: ${color};`,
      'background:transparent'
    )
  }
  closeConsole() {
    Log.console = false
  }
}
export class EventDispatcher extends Log {
  listeners = {}

  addEventListener(type, listener) {
    if (!this.listeners[type]) {
      this.listeners[type] = []
    }
    if (this.listeners[type].indexOf(listener) === -1) {
      this.listeners[type].push(listener)
    }
  }

  removeEventListener(type) {
    this.listeners[type] = []
  }

  dispatchEvent(type, data) {
    const listenerArray = this.listeners[type] || []
    if (listenerArray.length === 0) return
    listenerArray.forEach((listener) => {
      listener.call(this, data)
    })
  }
}
