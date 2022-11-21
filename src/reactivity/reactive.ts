/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-18 16:56:45
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-21 17:47:10
 * @FilePath: \mini-vue-myself\src\reactivity\reactive.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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

const readonly = () => {

}

export {
    reactive,
    readonly
}