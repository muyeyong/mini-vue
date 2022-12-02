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
        const people = reactive({ age: 8 })
        const getter = jest.fn(() => {
            return people.age
        })
        const cValue = computed(getter)
        expect(getter).not.toHaveBeenCalled()
        expect(cValue.value).toBe(8)
        expect(getter).toBeCalledTimes(1)
        cValue.value
        expect(getter).toBeCalledTimes(1)

    })
})