/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-25 14:53:07
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-28 11:49:16
 * @FilePath: \mini-vue-myself\src\reactivity\reactive.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/* 
    劫持对象：get set
    收集依赖
    触发依赖
 */

import { mutableHandler, readonlyMutableHandler, shallowReadonlyMutableHandler } from './baseHandler'

export enum ReactiveFlags {
    isReactive = '__v_is_reactive',
    isReadonly = '__v-is_readonly'
}

const reactive = (raw) => {
    return createReactiveObj(raw, mutableHandler)
}

const readonly = (raw) => {
    return createReactiveObj(raw, readonlyMutableHandler)
}

const isReadonly = (value) => {
    return !!value[ReactiveFlags.isReadonly]
}

const shallowReadonly = (raw) => {
    return createReactiveObj(raw, shallowReadonlyMutableHandler)
}

const shallowReactive = (raw) => {
    return createReactiveObj(raw, shallowReadonlyMutableHandler)
}

const isReactive = (value) => {
    return !!value[ReactiveFlags.isReactive]
}

const isProxy = (value) => {
    return isReactive(value) || isReadonly(value)
}

function createReactiveObj(raw, handler) {
    return new Proxy(raw, handler)
}
export {
    reactive,
    readonly,
    isReadonly,
    isReactive,
    isProxy,
    shallowReactive,
    shallowReadonly
}