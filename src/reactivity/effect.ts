/* 
    接受一个函数
 */

import { extend } from "../shared"
let activeEffect

class Effect {
    private _fn: any 
    public deps = []
    public active = true
    constructor(fn) {
        this._fn = fn
    }
    run () {
        activeEffect = this
        return this._fn()
    }
    stop () {
        // clearupEffect
        // 去除自身的deps里面的dep有什么用了？ 不应该是去除targetMap里面的吗 指向同一个对象
        if (this.active) {
            clearupEffect(this)
            this.active = false
        }
    }
}

function clearupEffect (effect) {
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
    if (!activeEffect || !activeEffect.active) return
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
     // DOWN 被触发了很多次，如果存在就不要触发
    if (dep.has(activeEffect)) return
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}

/* 触发依赖 */
const trigger = (target, key) => {
    const deps = targetMap.get(target)
    const dep = deps.get(key)
    for (let f of dep) {
        f.scheduler ? f.scheduler() : f.run()
    }
}
const effect = (fn, option?) => {
    const _insatance = new Effect(fn)
    extend(_insatance, option)
    _insatance.run()
    const runner: any =  _insatance.run.bind(_insatance)
    runner.effect = _insatance
    return runner
}
const stop = (runner) => {
// 通过runner反向查找
    runner.effect.stop()
}

export {
    effect,
    track,
    trigger,
    stop
}