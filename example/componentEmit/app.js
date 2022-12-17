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
        }, 
        // string
        // 'Hello'
        // Array
        [ 
            h('div', {}, 'App'),
            h(Foo, 
                { 
                    count: 1, 
                    onAdd: () => {
                        console.log('App onAdd called')
                    },
                    onAddCount: () => {
                        console.log('add count')
                        this.count++
                    }
            }, '')
        ]
       )
    },
    setup (){
        return { msg: 'muyeyong'}
    }   
}