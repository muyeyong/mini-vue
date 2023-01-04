import { h, ref, createTextVnode } from '../../lib/mini-vue.es.js'

export const ArrayToText = {
     render() {
        const active = ref(false)
        const preChildren = h('div', {} , [h('span', {}, '1'), h('div', {}, '2')])
        const nextChildren = h('div', {}, 'text') //createTextVnode('text')
        return h('div', {}, active.value ? nextChildren : preChildren)
     },
     setup() {
        return {}
     }
}