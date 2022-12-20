import { h } from '../../lib/mini-vue.es.js'
import { Foo } from './foo.js'
export const App = {
    render() {
       return  h(
        'div', 
        {
            id: 'root',
            class: 'red header',
        }, 
        [ 
            h('div', {}, 'App'),
            // 在children里面赋值， Foo可以访问到 通过this.$slot访问
            h(Foo, {}, 
                {
                    footer: ({ age }) => h('div', {}, 'footer' + age),
                    header: h('div', {}, 'header'),
                }
            )
        ]
       )
    },
    setup (){
        return { msg: 'muyeyong'}
    }   
}