import { effect } from '../effect'
import { reactive } from '../reactive'
describe('effect', () => {
    it('effectBase', () => {
        let num = 2
        effect(() => num = 3)
        expect(num).toBe(3)
    })
    it('effectPro', () => {
        let num1
        let num2 = reactive({ age: 4})
        effect(() => {
            console.log('我被执行了')
            num1 = num2.age + 1
        })
        expect(num1).toBe(5)
        // update
        num2.age++
        expect(num1).toBe(6)
    })
})