import { h, ref, createTextVnode } from '../../lib/mini-vue.es.js'

const preChildren = 'text'
const nextChildren = [h('div', {}, [ h('div', {}, '1'), h('div', {}, '2')])]

export const TextToArray = {
    render() {
        return this.active ? h('div', {}, nextChildren) : h('div', {}, preChildren)
    },
    setup() {
        const active = ref(false)
        window.active = active
        return { active }
    }
}