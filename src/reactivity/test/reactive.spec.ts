/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-18 16:56:45
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-28 15:21:35
 * @FilePath: \mini-vue-myself\src\reactivity\test\reactive.spec.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { reactive, isReactive, isProxy } from '../reactive'
describe('reactive', () => {
    it('reactiveTest', () => { // TODO 只想执行reativeTest 怎么处理
        const origin = { foo: 1 }
        const reactiveObj = reactive(origin)
        expect(isProxy(reactiveObj)).toBe(true)
        expect(isProxy(origin)).toBe(false)
        expect(origin).not.toBe(reactiveObj)
    })
    it('isReactive', () => {
        const origin = { age: 89 }
        const wrap = reactive(origin)
        expect(isReactive(origin)).toBe(false)
        expect(isReactive(wrap)).toBe(true)
    })
    it('nested reactive', () => {
        const origin = { 
            people: {
                age: 18
            },
            list: [ { a: 4 }]
         }
         const wrap = reactive(origin)
         expect(isReactive(wrap.people)).toBe(true)
         expect(isReactive(wrap.list[0])).toBe(true)
    })
})