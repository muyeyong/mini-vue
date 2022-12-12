import { render } from "./renderer"
import { createVnode } from "./vnode"

export const createApp = (rootComponent) => {
   return {
    mount(rootContainer) {
        // 操作vnode
        const vnode = createVnode(rootComponent)
        render(vnode, rootContainer)
    }
   }
}

