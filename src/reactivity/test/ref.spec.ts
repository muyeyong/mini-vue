import { ref } from "../ref"

describe('ref', () => {
    it('happy path', () => {
        const count = ref(0)
        expect(count.value).toBe(0)
    })
})