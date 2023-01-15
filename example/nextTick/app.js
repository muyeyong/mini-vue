import { h, ref, getCurrentInstance, nextTick } from '../../lib/mini-vue.es.js'
export const App = {
    render() {
        return  h(
            'div', 
            {
                id: 'app',
            },
            [ 
                h('span', { class: 'blue'}, [h('p', { class: 'blue'}, `hello, ${this.count}`)]), 
                h('button', { class: 'red', onClick: this.onClick }, '点击修改count'),
               
            ]
        )
    },
    setup (){
        const count = ref(0)
        const instance = getCurrentInstance()

        const onClick = () => {
           for ( let i = 0; i < 100 ; i += 1) {
                count.value = i
           }
           console.log(instance)
           nextTick(() => {
            console.log('nexttick', instance)
           })
        }
        return { count,  onClick}
    }   
}