/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-18 16:56:45
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-18 17:56:48
 * @FilePath: \mini-vue-myself\src\reactivity\effect.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/* 
    接受一个函数
 */

class Effect {
    private _fn: any 
    public scheduler: any
    constructor(fn, { schaeuler}) {
        this._fn = fn
        this.scheduler = schaeuler
    }
    run () {
        activeEffect = this
        this._fn()
        return this._fn.bind(this)
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
        console.log('f',f)
        f.scheduler ? f.scheduler() : f.run()
    }
}
const effect = (fn, option?) => {
    console.timeLog('option', option)
    const insatnce = new Effect(fn, { ...option })
    return insatnce.run()
}

export {
    effect,
    track,
    trigger
}