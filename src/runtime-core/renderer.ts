import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer (options) {
    const { 
            createElement: hostCreateElement, 
            insert: hostInsert, 
            patchProp: hostPatchProp,
            remove: hostRemove,
            setElementText: hostSetElementText 
        } = options
    
    function render(vnode, container) {
        patch(null, vnode, container)
    }

    function patch (n1, n2, container, anchor = null, parentComponent = null) {
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
                processFragment(n1, n2, container, parentComponent)
                break;
            case Text: 
                processText(n1, n2, container)
                break;
            default:
                if ( n2.shapeFlag & ShapeFlags.ELEMENT) { 
                    processElement(n1, n2, container, anchor, parentComponent)
                } else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) { 
                    processComponent(n1, n2, container, parentComponent)
                }
                break;
        }
    }

    function processElement(n1, n2: any, container: any, anchor, parentComponent) {
        if (!n1) {
            mountElement(n2, container, anchor, parentComponent)
        } else {
            patchElement(n1, n2,  container)
        }
    }

    function mountElement(vnode, container,anchor, parentComponent) {
        const { props, children} = vnode
        // 处理element
        const el = vnode.el = hostCreateElement(vnode.type) 
        // props
        for(const key in props) {
            hostPatchProp(el, key, props[key])
        }
        // children
        if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parentComponent)
        } else {
            hostSetElementText(el, children)
        }
        hostInsert(el, anchor, container)
    }

    function patchElement(n1, n2, container) {
        const oldProps = n1.props
        const newProps = n2.props
        const el = n2.el = n1.el 
        patchProps(oldProps, newProps, el)
        patchChildren(n1, n2, container, el)
    }

    function patchProps(oldProps, newProps, el) {
        if (oldProps !== newProps) {
            for(const key in newProps) {
                if (oldProps[key] !== newProps[key]) {
                    hostPatchProp(el, key, newProps[key])
                }
            }
    
            for(const key in oldProps) {
                if (!(key in newProps)) {
                    hostPatchProp(el, key, null)
                }
            }
        }
       
    }

    function patchChildren(n1, n2, container,  parentComponent) {
        // 对比孩子
        console.log('patchChildren', n1, n2)
        if (n1.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            if (n2.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
                 // Array -> Text
                 //1. 删除n1 children
                unmountChildren(n1)
                //2. 添加n2 children
                hostSetElementText(container, n2.children)
            } else {
                patchKeyedChildren(n1, n2, container, parentComponent)
            }
        } else if (n1.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (n2.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // text -> Array
                // 删除n1 children
                hostSetElementText(container, '')
                mountChildren(n2, container, parentComponent)
            } else {
                if (n1.children !== n2.children) {
                    hostSetElementText(container, n2.children)
                }
            }
        }
    }

    function unmountChildren(vnode) {
        const children = vnode.children
        for(let i = 0; i < children.length; i += 1) {
            const el = children[i].el
            hostRemove(el)
        }
    }

    function patchKeyedChildren(n1, n2, container, parentComponent) {
        console.log('patchKeyedChildren')
        let i = 0
        let e1 = n1.children.length - 1
        let e2 = n2.children.length - 1

        const c1 = n1.children
        const c2 = n2.children

        const isSameVNode = (n1, n2) => n1.type === n2.type && n1.key === n2.key

        // 左端对比
        while( i <= e1 && i<= e2 ) {
            if (isSameVNode(c1[i], c2[i])) {
                // 为什么需要patch，递归处理
                patch(c1[i], c2[i], container, null, parentComponent)
            } else {
                break
            }
            i++
        }

        // 右端对比
        while( i <= e1 && i <= e2 ) {
            if (isSameVNode(c1[e1], c2[e2])) {
                patch(c1[e1], c2[e2], container, null, parentComponent)
            } else {
                break
            }
            e1--
            e2--
        }

        /* 
         新的比老的多 右侧新增
          ab
          abcd
        **/

        // if (i > e1 && i < e2) {
        //      // 这里因该是一个while循环
        //     patch(null, c2[i], container, null, parentComponent)
        // }

        /* 
            新的比老的多 左侧新增
            ab
            cab
        **/
        // if ( i > e1 && i <= e2) {
        //     // 这里因该是一个while循环
        //     let anchorIndex = e2 + 1
        //     const anchor = c2[anchorIndex].el // 需要变化
        //     patch(null, c2[e2], container, anchor,  parentComponent)
        // }

        if ( i > e1 ) {
            if ( i <= e2 ) {
                // 需要新增的情况，考虑往左侧还是右侧新增
                // i >= e1 + 1 // 右侧
                // i <
                const anchor = i + 1 > c2.length ? null : c2[i + 1].el // TODO 是否需要之前的锚点
                while( i <= e2) {
                    patch(null, c2[i], container, anchor,  parentComponent)
                    i++
                }
            }
        } else {
            if( i <= e1 ) {
                while( i <= e1 ) {
                    hostRemove(c1[i].el, parentComponent)
                    i++
                }
            }
        }
    }

    function mountChildren(vnode: any, container: any, parentComponent) {
        vnode.children.forEach(v => {
            patch(null, v, container, null, parentComponent)
        })
    }

    function processComponent(n1, n2, container: any, parentComponent) {
        mountComponent(n1, n2, container, parentComponent)
    }

    function mountComponent(n1, n2, container, parentComponent) {
        const instance = createComponentInstance(n2, parentComponent)
        setupComponent(instance)
        setupRenderEffect(instance, container)
    }

    function setupRenderEffect(instance, container) {
        effect(() => {
            if (instance.isMounted) {
                const { proxy, subTree: prevSubTree } = instance
                const nextSubTree = instance.render.call(proxy)
                instance.subTree = nextSubTree
                patch(prevSubTree, nextSubTree, prevSubTree.el, null, instance)
            } else {
                const { proxy } = instance
                const nextSubTree = instance.render.call(proxy)
                patch(null, nextSubTree, container, null, instance)
                instance.vnode.el = nextSubTree.el
                instance.subTree = nextSubTree
                instance.isMounted = true
            }
        })
    }

    function processFragment(n1, n2: any, container: any, parentComponent) {
        mountChildren(n2, container, parentComponent)
    }

    function processText(n1, n2: any, container: any) {
        if(!n1) {

        } else {

        }
        const { children } = n2
        const el = n2.el = document.createTextNode(children)
        container.append(el)
    }

    function mountText() {

    }

    return {
        createApp: createAppAPI(render)
    }
}

