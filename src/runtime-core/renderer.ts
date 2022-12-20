import { isReadonly } from "../reactivity/reactive"
import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createVnode } from "./vnode"

export function render(vnode, container) {
    patch(vnode, container)
}

function patch (vnode, container) {
    // 如果vnode不是一个虚拟节点, 处理children: ['1', '2']
    //TODO 需要这样做吗
    // 如果真的想要渲染一个字符串，用h函数包裹起来 h('', {}, str)
    // if (!isObject(vnode)) {
    //     vnode = createVnode('div',{}, vnode)
    // }
    if ( vnode.shapeFlag & ShapeFlags.ELEMENT) { // element
        processElement(vnode, container)
    } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) { // component
        // 处理component
        processComponent(vnode, container)
    }
}

function processElement(vnode: any, container: any) {
    const { props, children} = vnode
    // 处理element
    const el = vnode.el = document.createElement(vnode.type)
    // props
    for(const key in props) {
        const isEvent = str => /^on[A-Z]/.test(str)
        if (isEvent(key)) {
            const eventName = key.slice(2).toLocaleLowerCase()
            el.addEventListener(eventName, props[key])
        } else {
            el.setAttribute(key, props[key])
        }
    }
    // children
    if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
       children.forEach(v => {
        patch(v, el)
       })
    } else {
        el.textContent = children
    }
    container.append(el)
}
function processComponent(vnode: any, container: any) {
    mountComponent(vnode, container)
}

function mountComponent(vnode: any, container) {
    const instance = createComponentInstance(vnode)
    setupComponent(instance)
    setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
   const { proxy } = instance
   const subTree = instance.render.call(proxy)
   patch(subTree, container)
   instance.vnode.el = subTree.el
}

