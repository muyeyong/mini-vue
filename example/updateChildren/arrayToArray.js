import { h, ref } from '../../lib/mini-vue.es.js'


// 左侧对比
// const preChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'C' }, 'C'),
// ]

// const nextChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'D' }, 'E'),
//     h('div', { key: 'E' }, 'E')
// ]

// 右侧新增
const preChildren = [
    h('div', { key: 'A' }, 'A'),
    h('div', { key: 'B' }, 'B'),
]

const nextChildren = [
    h('div', { key: 'A' }, 'A'),
    h('div', { key: 'B' }, 'B'),
    h('div', { key: 'C' }, 'C'),
    h('div', { key: 'D' }, 'D')
]

// 左侧新增
// const preChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
// ]

// const nextChildren = [
//     h('div', { key: 'C' }, 'C'),
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
// ]



export const ArrayToArray = {
 setup() {
    const active = ref(false)
    window.active = active
    return { active }
 },
 render() {
    return this.active ? h('div', {}, nextChildren) : h('div', {}, preChildren)
 }
}