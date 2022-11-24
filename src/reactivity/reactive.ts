/* 
    劫持对象：get set
    收集依赖
    触发依赖
 */

import { mutableHandler, readonlymutableHandler } from './baseHandler'

const reactive = (raw) => {
    return createReactiveObj(raw, mutableHandler)
}

const readonly = (raw) => {
    return createReactiveObj(raw, readonlymutableHandler)
}

function createReactiveObj(raw, handler) {
    return new Proxy(raw, handler)
}
export {
    reactive,
    readonly
}