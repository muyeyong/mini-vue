import { readonly } from "../reactive"

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
    })
})