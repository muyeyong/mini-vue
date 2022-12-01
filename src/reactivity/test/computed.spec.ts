import { computed } from "../computed"
import { reactive } from "../reactive"

describe('computed', () => {
    it('happy path', () => {
        const people = reactive({ age: 18 })
        const age = computed(() => {
            return people.age
        })
        expect(age.value).toBe(18)
        // people.age = 20
        // expect(age.value).toBe(20)
    }),
    it('lazily', () => {

    })
})