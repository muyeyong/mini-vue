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
// const preChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
// ]

// const nextChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'C' }, 'C'),
//     h('div', { key: 'D' }, 'D')
// ]

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

// 老的比新的多，进行删除

// const preChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'C' }, 'C'),
//     h('div', { key: 'D' }, 'D')
// ]

// const nextChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
// ]

// 中间对比

// const preChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'C' }, 'C'),
//     h('div', { key: 'D', id: 'old-D' }, 'D'),
//     h('div', { key: 'E' }, 'E'),
//     h('div', { key: 'G' }, 'G'),
//     h('div', { key: 'F' }, 'F')
// ]

// const nextChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'C' }, 'C'),
//     h('div', { key: 'E' }, 'E'),
//     h('div', { key: 'D', id: 'new-D' }, 'D'),
//     h('div', { key: 'F' }, 'F')
// ]

// 中间对比优化-新节点遍历完，旧节点直接删除

const preChildren = [
    h('div', { key: 'A' }, 'A'),
    h('div', { key: 'D', id: 'old-D' }, 'D'),
    h('div', { key: 'E' }, 'E'),
    h('div', { key: 'G' }, 'G'),
    h('div', { key: 'K' }, 'K'),
    h('div', { key: 'F' }, 'F')
]

const nextChildren = [
    h('div', { key: 'A' }, 'A'),
    h('div', { key: 'E' }, 'E'),
    h('div', { key: 'K' }, 'K'),
    h('div', { key: 'D', id: 'new-D' }, 'D'),
    h('div', { key: 'F' }, 'F')
]



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