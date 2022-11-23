/* 
    接受一个函数
 */

import { extend } from "../shared"

class Effect {
    private _fn: any 
    public deps = []
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
        clearupEffect(this)
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
let activeEffect
const targetMap = new Map()
const track = (target, key) => {
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
     // TODO 被触发了很多次，如果存在就不要触发
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