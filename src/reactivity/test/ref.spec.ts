import { effect } from "../effect"
import { isRef, proxyRefs, ref, unRef } from "../ref"

describe('ref', () => {
    it('happy path', () => {
        const count = ref(0)
        expect(count.value).toBe(0)
    }),
    it('should be reactive', () => {
        const a = ref(1)
        let dummy
        let call = 0
        effect(() => {
            call++
            dummy = a.value
        })
        expect(call).toBe(1)
        expect(dummy).toBe(1)
        a.value++
        expect(call).toBe(2)
        expect(dummy).toBe(2)
        // no change
        a.value = 2
        expect(call).toBe(2)
        expect(dummy).toBe(2)
    }),
    it('nested object', () => {
        const origin = { foo: 1 }
        const originRef = ref(origin)
        let dummmy
        expect(originRef.value.foo).toBe(1)
        effect(() => {
            dummmy = originRef.value.foo
        })
        expect(dummmy).toBe(1)
        originRef.value.foo = 2
        expect(dummmy).toBe(2)
    }),
    it('isRef', () => {
        const a = ref(1)
        expect(isRef(a)).toBe(true)
        expect(isRef(1)).toBe(false)
    }),
    it('unRef', () => {
        const a = ref(3)
        expect(unRef(a)).toBe(3)
        expect(a.value).toBe(3)
        expect(unRef(2)).toBe(2)
    }),
    it('proxyRefs', () => {
        const origin = {
            a: ref(1),
            b: 2
        }
        const proxyOrigin = proxyRefs(origin)
        expect(proxyOrigin.a).toBe(1)
        expect(proxyOrigin.b).toBe(2) 
        // 重新赋值
        proxyOrigin.a = 5
        expect(proxyOrigin.a).toBe(5)
    })
})