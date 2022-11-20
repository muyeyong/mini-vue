/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-18 16:56:45
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-21 17:57:35
 * @FilePath: \mini-vue-myself\src\reactivity\test\effect.spec.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { effect, stop } from '../effect'
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
            num1 = num2.age + 1
        })
        expect(num1).toBe(5)
        // update
        num2.age++
        expect(num1).toBe(6)
    })
    it('effectScheduler', () => {
        const person = reactive({ age: 18 })
        let run
        const scheduler = jest.fn(() => {
            run = runner
        })
        let age
        // 执行runner 会执行传入的函数
       const runner = effect(() => {
            age = person.age
            return 'hello'
       }, { scheduler } )
        expect(scheduler).not.toHaveBeenCalled()
        expect(age).toBe(18)
        person.age++
        expect(scheduler).toHaveBeenCalledTimes(1)
        const r = runner()
        expect(r).toBe('hello')
        // expect(age).toBe(20)
        // 响应式对象变化后，不会执行fun，会执行scheduler
    })
    it("stop", () => {
        let dummy;
        const obj = reactive({ prop: 1 });
        const runner = effect(() => {
          dummy = obj.prop;
        });
        obj.prop = 2;
        expect(dummy).toBe(2);
        stop(runner);
        // obj.prop = 3
        obj.prop++;
        expect(dummy).toBe(2);
    
        // stopped effect should still be manually callable
        runner();
        expect(dummy).toBe(3);
      });
      it('onStop', () => {

      })
})