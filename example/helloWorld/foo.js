import { h } from '../../lib/mini-vue.es.js'

export const Foo = {
    setup(props) {
        console.log('props 233', props)
        // props.count++
    },
    render() {
        return h('div', {}, 'foo props' + this.count)
    },
}