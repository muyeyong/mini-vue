/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-28 15:27:03
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-29 10:23:44
 * @FilePath: \mini-vue-myself\src\reactivity\ref.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { isTracking, trackEffect, triggerEffect } from "./effect"

// ref 可以传入单个值
/* 
    如果需要响应式的话，需要track 和 trigger
 */
class RefImpl {
    private _value 
    public dep = new Set()
    constructor(value) {
        this._value = value
    }
    get value() {
        if (isTracking()) {
            trackEffect(this.dep)
        }
        return this._value
    }
    set value(val) {
        this._value = val
        triggerEffect(this.dep)
    }
}
export const ref = (value) => {
    return new RefImpl(value)
}