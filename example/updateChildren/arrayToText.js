import { h, ref, createTextVnode } from '../../lib/mini-vue.es.js'
const preChildren = [h('div', {} , [h('span', {}, '1'), h('div', {}, '2')])]
// TODO 对于类型的判断是否靠谱？
const nextChildren = 'text' // createTextVnode('text') ==> shapFlag类型不能匹配上text-children

export const ArrayToText = {
     render() {
        // render每次都会重新执行
        // TODO 如果不用h包裹，直接使用  this.active ? nextChildren  : preChildren，会走processText的逻辑
        return this.active ? h('div', {}, nextChildren)  : h('div', {}, preChildren)
     },
     setup() {
        const active = ref(false)
        window.active = active
        return { active }
     }
}