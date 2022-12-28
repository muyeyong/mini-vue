import { createVnode } from "./vnode"

export function createAppAPI(render) {
  return (rootComponent) => {
        return {
         mount(rootContainer) {
             // 操作vnode
             const vnode = createVnode(rootComponent)
             render(vnode, rootContainer)
         }
        }
     }
}
