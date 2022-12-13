import { isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    patch(vnode, container)
}

function patch (vnode, container) {
    if (typeof vnode.type === 'string') {
        const { props, children} = vnode
        // 处理element
        const el = vnode.el = document.createElement(vnode.type)
        // props
        for(const key in props) {
            el.setAttribute(key, props[key])
        }
        // children
        if (Array.isArray(children)) {
           children.forEach(v => {
            patch(v, el)
           })
        } else {
            el.textContent = children
        }
        container.append(el)

    } else if (isObject(vnode.type)) {
        // 处理component
        precessComponent(vnode, container)
    }
}

function precessComponent(vnode: any, container: any) {
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

