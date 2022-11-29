/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-28 15:27:03
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-29 11:01:55
 * @FilePath: \mini-vue-myself\src\reactivity\ref.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { isObject } from "../shared"
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
        // TODO 这样判断对于对象不起作用？
        if (val === this._raw) return
        this._value = isObject(val) ? reactive(val) : val
        this._raw = val
        triggerEffect(this.dep)
    }
}
export const ref = (value) => {
    return new RefImpl(value)
}