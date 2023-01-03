import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer (options) {
    const { createElement: hostCreateElement, insert: hostInsert, patchProp: hostPatchProp} = options
    
    function render(vnode, container) {
        patch(null, vnode, container)
    }

    function patch (n1, n2, container, parent?) {
        // 如果vnode不是一个虚拟节点, 处理children: ['1', '2']
        //TODO 需要这样做吗
        /* 
        如果真的想要渲染一个字符串，用h函数包裹起来 h('', {}, str)
        if (!isObject(vnode)) {
                vnode = createVnode('div',{}, vnode)
            }
        不需要这样做，会创造出过多的dom节点
        **/
        
        const { type } = n2
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parent)
                break;
            case Text: 
                processText(n1, n2, container)
                break;
            default:
                if ( n2.shapeFlag & ShapeFlags.ELEMENT) { 
                    processElement(n1, n2, container, parent)
                } else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) { 
                    processComponent(n1, n2, container, parent)
                }
                break;
        }
    }

    function processElement(n1, n2: any, container: any, parent) {
        if (!n1) {
            mountElement(n2, container)
        } else {
            patchElement(n1, n2, container)
        }
    }

    function mountElement(vnode, container) {
        const { props, children} = vnode
        // 处理element
        const el = vnode.el = hostCreateElement(vnode.type) 
        // props
        for(const key in props) {
            hostPatchProp(el, key, props[key])
        }
        // children
        if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parent)
        } else {
            el.textContent = children
        }
        //TODO hostInsert()
        hostInsert(el, container)
    }

    function patchElement(n1, n2, container) {

        console.log(n1, n2)
        const oldProps = n1.props
        const newProps = n2.props
        patchProps(oldProps, newProps, n2)
    }

    function patchProps(oldProps, newProps, el) {
        //TODO 暂不支持 新增props
        // 修改props
        for(const key in newProps) {
            if (oldProps[key] !== newProps[key]) {
                hostPatchProp(el, key, newProps[key])
            }
        }
        // 删除props
    }

    function mountChildren(vnode: any, container: any, parent) {
        vnode.children.forEach(v => {
            patch(null, v, container, parent)
        })
    }

    function processComponent(n1, n2, container: any, parent) {
        mountComponent(n1, n2, container, parent)
    }

    function mountComponent(n1, n2, container, parent) {
        const instance = createComponentInstance(n2, parent)
        setupComponent(instance)
        setupRenderEffect(instance, container)
    }

    function setupRenderEffect(instance, container) {
        effect(() => {
            if (instance.isMounted) {
                const { proxy, subTree: prevSubTree } = instance
                const nextSubTree = instance.render.call(proxy)
                patch(prevSubTree, nextSubTree, container, instance)
            } else {
                const { proxy } = instance
                const nextSubTree = instance.render.call(proxy)
                patch(null, nextSubTree, container, instance)
                instance.vnode.el = nextSubTree.el
                instance.subTree = nextSubTree
                instance.isMounted = true
            }
        })
    }

    function processFragment(n1, n2: any, container: any, parent) {
        mountChildren(n2, container, parent)
    }

    function processText(n1, n2: any, container: any) {
        const { children } = n2
        const el = n2.el = document.createTextNode(children)
        container.append(el)
    }
    return {
        createApp: createAppAPI(render)
    }
}

