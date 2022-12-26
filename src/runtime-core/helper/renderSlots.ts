import { h } from "../h"
import { Fragment } from "../vnode"

export const renderSlots = (slots, key, props) => {
    let slot = slots[key]
    if (typeof slot === 'function') {
        slot = slot(props)
    }
    // slot 本身就是一个虚拟节点
    /* 
        slot 为什么是一个数组，在componentSlots进行过处理，将slot全部转换成数组
        如果是component，h函数的第三个参数需要是Array
    **/
    // console.log('slot', slot, h('div', {}, slot))
    return h(Fragment, {}, slot)
}
  