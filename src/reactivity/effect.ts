/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-28 09:06:04
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-29 10:17:52
 * @FilePath: \mini-vue-myself\src\reactivity\effect.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/* 
    接受一个函数
 */

import { extend } from "../shared"
let activeEffect = undefined as any
let shouldTrack = false

class Effect {
    private _fn: any 
    public deps = []
    public active = true
    public onStop?: () => void
    constructor(fn) {
        this._fn = fn
    }
    run () {
        if (!this.active) {
            return this._fn()
        }
        activeEffect = this
        shouldTrack = true
        const res = this._fn()
        activeEffect = undefined
        shouldTrack = false
        return res
    }
    stop () {
        // cleanupEffect
        // 去除自身的deps里面的dep有什么用了？ 不应该是去除targetMap里面的吗 指向同一个对象
        if (this.active) {
            cleanupEffect(this)
            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

function cleanupEffect (effect) {
    if (effect.onStop) effect.onStop()
    effect.deps.forEach(dep => {
        dep.delete(effect)
    });
}

/* 
追踪依赖 
使用set =〉 key value的方式存储
*/

const targetMap = new Map()
const track = (target, key) => {
    // 如果单纯创建一个reactive对象
    if (!isTracking()) return
    let deps = targetMap.get(target)
    if (!deps) {
        deps = new Map()
        targetMap.set(target, deps)
    }
    let dep = deps.get(key)
    if (!dep) {
        dep = new Set()
        deps.set(key, dep)
    }
    trackEffect(dep)
}

const trackEffect = (dep) => {
     // DOWN 被触发了很多次，如果存在就不要触发
    if (dep.has(activeEffect)) return
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}

/* 触发依赖 */
const trigger = (target, key) => {
    const deps = targetMap.get(target)
    const dep = deps.get(key)
    triggerEffect(dep)
}

const triggerEffect = (dep) => {
    for (let f of dep) {
        f.scheduler ? f.scheduler() : f.run()
    }
}
const effect = (fn, option?) => {
    const _instance = new Effect(fn)
    extend(_instance, option)
    _instance.run()
    const runner: any =  _instance.run.bind(_instance)
    runner.effect = _instance
    return runner
}
const stop = (runner) => {
// 通过runner反向查找
    runner.effect.stop()
}

const isTracking = () => {
    return shouldTrack && activeEffect !== undefined
}

export {
    effect,
    track,
    trigger,
    trackEffect,
    triggerEffect,
    isTracking,
    stop
}