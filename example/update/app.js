import { h, ref } from '../../lib/mini-vue.es.js'
export const App = {
    render() {
        //TODO 写在这里压根就不会去调用 proxyrefs ==> get， 为什么了？
        const addCount = () => {
            this.count = 2
            console.log(this.count)
        }
        return  h(
            'div', 
            {
                id: 'root',
                class: 'red header',
            },
            [ 
                h('span', { class: 'blue'}, [h('p', { class: 'blue'}, `hello, ${this.count}`)]), 
                h('button', { class: 'red', onClick: this.addCount }, '点击修改count'),
            ]
        )
    },
    setup (){
        const count = ref(0)
        const addCount = () => {
            count.value++
        }
        return {count, addCount}
    }   
}