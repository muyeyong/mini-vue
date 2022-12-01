/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-28 15:27:03
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-29 11:01:55
 * @FilePath: \mini-vue-myself\src\reactivity\ref.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { hasChange, isObject } from "../shared"
import { isTracking, trackEffect, triggerEffect } from "./effect"
import { reactive } from "./reactive"

// ref 可以传入单个值
/* 
    如果需要响应式的话，需要track 和 trigger
 */
class RefImpl {
    private _value 
    private _raw
    public dep = new Set()
    private __v_is_ref = true
    constructor(value) {
        /* 
            如果是一个对象，就完全变成reactive了，虽然会触发本身以及reactive的get，但实现响应式以来的是reactive
            这里是不是可以像reactive一样递归的遍历每一个key
        */ 
        this._value =  isObject(value) ? reactive(value) : value
        this._raw = value
    }
    get value() {
        if (isTracking()) {
            trackEffect(this.dep)
        }
        return this._value
    }
    set value(val) {
        // TODO 这样判断对于对象不起作用？ DOWN
        if (!hasChange(val, this._raw)) return
        this._value = isObject(val) ? reactive(val) : val
        this._raw = val
        triggerEffect(this.dep)
    }
}
export const ref = (value) => {
    return new RefImpl(value)
}

export const isRef = (value) => {
    return !!value.__v_is_ref
}

export const unRef = (value) => {
   return isRef(value) ? value.value : value
}

export const proxyRefs = (obj) => {
    // 需要劫持对象的get set
    // TODO 为什么set get 操作不全部用Reflect
   return new Proxy(obj, {
        get(target, key) {
            // 如果这个值是ref
        //    const res = Reflect.get(target, key)
        //    if (isRef(res)) {
        //     return res.value
        //    } else {
        //     return res
        //    }
        return unRef(Reflect.get(target, key))
        },
        set(target, key, value) {
            // value也需要判断
            const res = Reflect.get(target, key)
            // if (isRef(res)) {
            //     // 不需要判断是不是响应式对象吗
            //     if (isRef(value)) {
            //        Reflect.set(target, key, value)
            //     } else {
            //         Reflect.set(res, 'value', value)
            //     }
            // } else {
            //     Reflect.set(target, key, value)
            // }
            // return true
            if (isRef(res) && !isRef(value)) {
                return target[key].value = value
            } else {
                return Reflect.set(target, key, value)
            }
        }
    })
}