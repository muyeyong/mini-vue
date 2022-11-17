/* 
    劫持对象：get set
    收集依赖
    触发依赖
 */
import { track, trigger } from './effect'
const reactive = (target) => {
    return new Proxy(target, 
        {
            get(target, key) {
                track(target, key)
                return Reflect.get(target, key)
            },
            set(target, key, value) {
                const res = Reflect.set(target, key, value)
                trigger(target, key)
                return res
            }
        }
    )
}

export {
    reactive
}