import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    patch(vnode, container)
}

function patch (vnode, container) {
    precessComponent(vnode, container)
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
   const subTree = instance.render()
   patch(subTree, container)
}

