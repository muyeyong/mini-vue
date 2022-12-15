import { h } from '../../lib/mini-vue.es.js'
import { Foo } from './foo.js'
export const App = {
    render() {
        window.app = this
        //TODO 第二个参数是props，如果不传 例如h('div', 'hello')，怎么保持hello赋值给children
       return  h(
        'div', 
        {
            id: 'root',
            //TODO 数组写的话['red', 'header']样式解析问题
            class: 'red header',
            onClick: () => console.log('click...')
        }, 
        // string
        // 'Hello'
        // Array
        [ 
            h('span', { class: 'blue'}, [h('p', { class: 'blue'}, `hello, ${this.msg}`)]), 
            h('span', { class: 'red'}, 'span2'),
            h(Foo, { count: 1 }, '')
        ]
       )
    },
    setup (){
        return { msg: 'muyeyong'}
    }   
}