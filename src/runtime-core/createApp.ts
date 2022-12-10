import { render } from "./renderer"
import { craeteVnode } from "./vnode"

export const createApp = (rootComponent) => {
   return {
    mount(rootContainer) {
        // 操作vnode
        const vnode = craeteVnode(rootComponent)
        render(vnode, rootContainer)
    }
   }
}

