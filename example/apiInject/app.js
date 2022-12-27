// esmodule --> import export
// commonjs --> exports require
import { h, createTextVnode, provide, inject } from '../../lib/mini-vue.es.js'

const Provider = {
    name: 'Provider',

    setup() {
        provide('a', 'a1')
    },
    
    render() {
        return h('div', {}, [ createTextVnode('Provider1'), h(Provider2) ])
    }
} 

const Provider2 = {
    name: 'Provider2',

    setup() {
        provide('a', 'a2')
        const a = inject('a')
        return { a }
    },
    
    render() {
        return h('div', {}, [ createTextVnode('Provider2: ' + this.a), h(Consumer) ])
    }
} 

const Consumer = {
    name: 'Consumer',

    setup() {
        const a = inject('a')
        return { a }
    },

    render() {
        return h('div', {}, `Consumber: ${this.a}`)
    }
}

export default  {
    name: 'App',
    
    setup() {},
     render() {
        return h('div', '', [h('span', {}, 'apiInject'), h(Provider)])
     }
}
