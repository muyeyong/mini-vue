import { h, ref } from '../../lib/mini-vue.es.js'
export const App = {
    render() {
        //TODO 写在这里压根就不会去调用 proxyrefs ==> get， 为什么了？
        //DOWN 
        const addCount = () => {
            console.log('233', this)
            this.count = 2
            console.log('render...', this.count)
        }
        return  h(
            'div', 
            {
                id: 'root',
                class: 'red header',
                ...this.props
            },
            [ 
                h('span', { class: 'blue'}, [h('p', { class: 'blue'}, `hello, ${this.count}`)]), 
                h('button', { class: 'red', onClick: this.addCount }, '点击修改count'),
                h('button', { onClick: this.changePropsDemo1 }, '修改props为新的值'),
                h('button', { onClick: this.changePropsDemo2 }, '修改props bar为undefined || null'),
                h('button', { onClick: this.changePropsDemo3 }, '删除props 的bar')
            ]
        )
    },
    setup (){
        const count = ref(0)
        const props = ref({
            foo: 'old-foo',
            bar: 'bar'
        })
        const addCount = () => {
            count.value++
            console.log('setup...', count.value)
        }

        const changePropsDemo1 = () => {
            // 修改
            props.value.foo = 'new-foo'
        }

        const changePropsDemo2 = () => {
            // 删除
            props.value.bar = undefined
        }

        const changePropsDemo3 = () => {
            // 新增 修改
            props.value = { foo: 'new1-foo', name: 'add'}
        }
        return {count, addCount, props, changePropsDemo1, changePropsDemo2, changePropsDemo3}
    }   
}