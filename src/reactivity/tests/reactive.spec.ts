import { reactive } from '../reactive'
describe('reactive', () => {
    it('reactiveTest', () => { // TODO 只想执行reativeTest 怎么处理
        const origin = { foo: 1 }
        const reactiveObj = reactive(origin)
        expect(origin).not.toBe(reactiveObj)
    })
})