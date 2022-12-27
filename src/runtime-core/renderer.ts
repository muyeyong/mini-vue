import { ShapeFlags } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode";

export function render(vnode, container) {
    // debugger
    patch(vnode, container)
}

function patch (vnode, container, parent?) {
    // 如果vnode不是一个虚拟节点, 处理children: ['1', '2']
    //TODO 需要这样做吗
    /* 
    如果真的想要渲染一个字符串，用h函数包裹起来 h('', {}, str)
     if (!isObject(vnode)) {
            vnode = createVnode('div',{}, vnode)
        }
    不需要这样做，会创造出过多的dom节点
    **/
    
    const { type } = vnode
    switch (type) {
        case Fragment:
            processFragment(vnode, container, parent)
            break;
        case Text: 
            processText(vnode, container)
            break;
        default:
            if ( vnode.shapeFlag & ShapeFlags.ELEMENT) { 
                processElement(vnode, container, parent)
            } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) { 
                processComponent(vnode, container, parent)
            }
            break;
    }
   
}

function processElement(vnode: any, container: any, parent) {
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
        mountChildren(vnode, el, parent)
    } else {
        el.textContent = children
    }
    container.append(el)
}

function mountChildren(vnode: any, container: any, parent) {
    vnode.children.forEach(v => {
        patch(v, container, parent)
    })
}


function processComponent(vnode: any, container: any, parent) {
    mountComponent(vnode, container, parent)
}

function mountComponent(vnode: any, container, parent) {
    const instance = createComponentInstance(vnode, parent)
    setupComponent(instance)
    setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
   const { proxy } = instance
   const subTree = instance.render.call(proxy)
   patch(subTree, container, instance)
   instance.vnode.el = subTree.el
}

function processFragment(vnode: any, container: any, parent) {
    mountChildren(vnode, container, parent)
}

function processText(vnode: any, container: any) {
    const { children } = vnode
    const el = vnode.el = document.createTextNode(children)
    container.append(el)
}

