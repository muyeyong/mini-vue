/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-18 16:56:45
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-22 10:30:00
 * @FilePath: \mini-vue-myself\src\reactivity\effect.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
        // 去除自身的deps里面的dep有什么用了？ 不应该是去除targetMap里面的吗 指向同一个对象
        targetMap.forEach(map => {
            map.forEach(m => console.log('targetMaps item size before', m.size))
        })
        this.deps.forEach((dep: any) => {
            dep.delete(this)
        })
        targetMap.forEach(map => {
            map.forEach(m => console.log('targetMaps item size after', m.size))
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
     // TODO 被触发了很多次，如果存在就不要触发
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}

/* 触发依赖 */
const trigger = (target, key) => {
    const deps = targetMap.get(target)
    const dep = deps.get(key)
    console.log('trigger', target, key, dep, dep.size)
    for (let f of dep) {
        f.scheduler ? f.scheduler() : f.run()
    }
}
const effect = (fn, option?) => {
    const _insatance = new Effect(fn, { ...option })
    // Object.assign(_insatnce, option)
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