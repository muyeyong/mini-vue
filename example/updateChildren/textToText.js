import { h, ref, createTextVnode } from '../../lib/mini-vue.es.js'

const preChildren = 'preText'
const nextChildren = 'nextText'

export const TextToText = {
    render() {
        return this.active ? h('div', {}, nextChildren) : h('div', {}, preChildren)
    },
    setup() {
        const active = ref(false)
        window.active = active
        return { active }
    }
}