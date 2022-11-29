import { effect } from "../effect"
import { ref } from "../ref"

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
        a.value = 2
        expect(call).toBe(2)
        expect(dummy).toBe(2)
    })
})