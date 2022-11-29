/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-25 14:53:07
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-28 11:40:00
 * @FilePath: \mini-vue-myself\src\reactivity\baseHandler.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { extend, isObject } from '../shared'
import { track, trigger } from './effect'
import { reactive, ReactiveFlags, readonly } from './reactive'

const createGetter = (isReadonly = false, shallow = false) => {
    return function get(target, key) {
        if (key === ReactiveFlags.isReactive) {
            return !isReadonly
        } else if (key === ReactiveFlags.isReadonly) {
            return isReadonly
        }
        if (!isReadonly) {
            track(target, key)
        }
        const res = Reflect.get(target, key)
        if (isObject(res) && !shallow) {
            return isReadonly? readonly(res) : reactive(res)
        }
        return res
    }
}
const createSetter = () => {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value)
        trigger(target, key)
        return res
    }
}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowGet = createGetter(true, true)

const mutableHandler = {
    get,
    set
}

const readonlyMutableHandler = {
    get: readonlyGet,
    set: function(target, key, value) {
        console.warn(`${target} just readonly`)
        return true
    }
}

const shallowReadonlyMutableHandler = extend({}, readonlyMutableHandler, {
    get: shallowGet
})

const shallowReactiveMutableHandler = extend({}, mutableHandler, {
    get: shallowGet
} )

export {
    mutableHandler,
    readonlyMutableHandler,
    shallowReadonlyMutableHandler,
    shallowReactiveMutableHandler
}