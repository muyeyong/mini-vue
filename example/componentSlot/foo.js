import { h, renderSlots } from '../../lib/mini-vue.es.js'

export const Foo = {
    setup(props) {
    },
    render() {
        // console.log('slots', this.$slots)
        const A = h('span', {}, 'a')
        // 作用域插槽
        const age = 18
        return h('div', {}, [
            h('div', {}, [renderSlots(this.$slots, 'header', { age }), A, renderSlots(this.$slots, 'footer', { age })]),
        ])
    },
}