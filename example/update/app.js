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
                ...this.props
            },
            [ 
                h('span', { class: 'blue'}, [h('p', { class: 'blue'}, `hello, ${this.count}`)]), 
                h('button', { class: 'red', onClick: this.addCount }, '点击修改count'),
                h('button', { onClick: this.changePropsDemo1 }, '修改props'),
                h('button', { onChick: this.changePropsDemo2 }, '删除props'),
                h('button', { onChick: this.changePropsDemo3 }, '新增props')
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
            //TODO 新增 还不支持
            props.value.newOther = 'newOther'
        }
        return {count, addCount, props, changePropsDemo1, changePropsDemo2, changePropsDemo3}
    }   
}