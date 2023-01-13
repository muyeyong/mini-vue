import { h, ref } from '../../lib/mini-vue.es.js'
export const App = {
    render() {
        return  h(
            'div', 
            {
                id: 'app',
            },
            [ 
                h('span', { class: 'blue'}, [h('p', { class: 'blue'}, `hello, ${this.count}`)]), 
                h('button', { class: 'red', onClick: this.addCount }, '点击修改count'),
                h(Child, { msg: this.props.foo }),
                h('button', { onClick: this.changeProps }, '修改props, 影响Child'),
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

        const changeProps = () => {
            // 修改
            props.value.foo = 'new-foo'
        }
        return { count, addCount, props, changeProps }
    }   
}

const Child = {
    render() {
        return h('div', {}, `props: ${this.msg}`)
    }, 
    setup(props) {
        return { props }
    }
}