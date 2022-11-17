/* 
    接受一个函数
 */

class Effect {
    private _fn: any 
    constructor(fn) {
        this._fn = fn
    }
    run () {
        activeEffect = this
        this._fn()
    }
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
    dep.add(activeEffect)
}

/* 触发依赖 */
const trigger = (target, key) => {
    const deps = targetMap.get(target)
    const dep = deps.get(key)
    for (let f of dep) {
        f.run()
    }
}
const effect = (fn) => {
    const insatnce = new Effect(fn)
    insatnce.run()
}

export {
    effect,
    track,
    trigger
}