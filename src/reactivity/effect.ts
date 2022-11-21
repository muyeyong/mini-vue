/* 
    接受一个函数
 */

class Effect {
    private _fn: any 
    public scheduler: Function | undefined
    public deps = []
    constructor(fn, { scheduler}) {
        this._fn = fn
        this.scheduler = scheduler
    }
    run () {
        activeEffect = this
        return this._fn()
    }
    stop () {
        // clearupEffect
        // 去除自身的deps里面的dep有什么用了？ 不应该是去除targetMap里面的吗
        this.deps.forEach((dep: any) => {
            dep.delete(this)
        })
    }
}

function clearupEffect (effect) {
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
    const _insatnce = new Effect(fn, { ...option })
    // Object.assign(_insatnce, option)
    _insatnce.run()
    const runner: any =  _insatnce.run.bind(_insatnce)
    runner.effect = _insatnce
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