/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-25 14:53:07
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-25 17:10:20
 * @FilePath: \mini-vue-myself\src\reactivity\test\readonly.spec.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { readonly, isReadonly } from "../reactive"

describe('readonly', () => {
    it('happy path', () => {
        const origin = { age: 12 }
        const obj = readonly(origin)
        expect(obj).not.toBe(origin)
        expect(obj.age).toBe(12)
    }),
    it('warning', () => {
        console.warn = jest.fn()
        const origin = { age: 12 }
        const obj = readonly(origin)
        obj.age = 18
        expect(console.warn).toHaveBeenCalled()
    }),
    it('isReadonly', () => {
        const origin = { foo: 0 }
        const wrap = readonly({ origin })
        expect(isReadonly(origin)).toBe(false)
        expect(isReadonly(wrap)).toBe(true)
    })
})