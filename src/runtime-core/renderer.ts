import { effect } from "../reactivity/effect";
import { objChange } from "../shared";
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
            patchElement(n1, n2, parentComponent)
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

    function patchElement(n1, n2, parentComponent) {
        const oldProps = n1.props
        const newProps = n2.props
        const el = n2.el = n1.el 
        patchProps(oldProps, newProps, el)
        patchChildren(n1, n2, el, parentComponent)
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

        if ( i > e1 ) {
            if ( i <= e2 ) {
                // 需要新增的情况，考虑往左侧还是右侧新增,决定anchor的值
                // i >= e1 + 1 // 右侧
                const anchor = i + 1 > c2.length ? null : c2[i + 1].el // TODO 是否需要之前的锚点
                while( i <= e2) {
                    patch(null, c2[i], container, anchor,  parentComponent)
                    i++
                }
            }
        } else if( i > e2) {
            if( i <= e1 ) {
                while( i <= e1 ) {
                    hostRemove(c1[i].el, parentComponent)
                    i++
                }
            }
        } else {
             /** 
                中间对比：
                    看旧的节点是否存在新的里面：1：使用for循环去遍历 2：将新的节点 s2 e2部分搜集成map结构，减少查询
                    如果存在：位置不一致？
                    如果不存在： 删除

                优化：
                    如果新节点全部遍历完了的话，老节点剩下的没有必要处理，直接删除

             */
             const s1 = i
             const s2 = i
             const toPatched = e2 - s2 + 1
             let patched = 0 
             let prevIndex = -1
             let move = false
             const newVNodeMap = new Map()
             // 需要对比的节点，新节点在老节点的位置对应
             const newVNodeIndexMapOldVNodeIndex = Array(toPatched)
             for( let j = s2; j <= e2 ; j += 1) {
                newVNodeMap.set(c2[j].key, j)
             }

             for( let j = 0; j < newVNodeIndexMapOldVNodeIndex.length; j += 1) {
                newVNodeIndexMapOldVNodeIndex[j] = -1
             }

             for ( let j = s1; j <= e1; j += 1) {
                if (patched === toPatched) {
                    console.log('直接删除处理: ', c1[j])
                    hostRemove(c1[j].el)
                    continue
                }
                //TODO if else 里面的逻辑重复了
                let newChildIndex
                // if (c1[i].key !== null && c1[i].key !== undefined) {
                //     newChildIndex = newVNodeMap.get(c1[i].key)
                //     if (newChildIndex !== undefined) { 
                //         // debugger
                //         /** TODO  2023-01-10
                //          * 位置变化怎么处理,  需要新的api
                //          *  1： c2去获取c2[newChildIndex]的兄弟节点
                //          *  2： c1中将c1[i]移动到1获取的兄弟节点之后
                //          *  这些都是dom操作？
                //          * 
                //          * 2023-01-11
                //          * 1：用最长递增子序列计算出最少的移动
                //          * 2：去操作dom
                //         */
                //        // 这里只会更新props之类的，不会影响元素位置
                //         // patch(c1[i], c2[newChildIndex], container, null, parentComponent)
                //         // patched += 1
                //     } else {
                //         hostRemove(c1[i].el)
                //     }
                // } else {
                //     for (let j = s2; j <= e2; j += 1) {
                //         if (isSameVNode(c2[j], c1[i])) {
                //             // patch(c1[i], c2[j], container, null, parentComponent)
                //             newChildIndex = j
                //             // patched += 1
                //             break
                //         } else {
                //             hostRemove(c1[i].el)
                //         }
                //     }
                // }

                //DOWN 2023-01-11 if else 提取重复的逻辑
                if (c1[j].key !== null && c1[j].key !== undefined) {
                    newChildIndex = newVNodeMap.get(c1[j].key)
                } else {
                    for (let j = s2; j <= e2; j += 1) {
                        if (isSameVNode(c2[j], c1[j])) {
                            newChildIndex = j
                            break
                        } 
                    }
                }
                if (newChildIndex !== undefined) {
                    //TODO 标记需不需要修改
                    // 如果一直是递增的就不需要处理
                    if ( newChildIndex > prevIndex && !move) {
                        prevIndex = newChildIndex
                    } else {
                        move = true
                    }
                    newVNodeIndexMapOldVNodeIndex[newChildIndex - s2] = j
                    patch(c1[j], c2[newChildIndex], container, null, parentComponent)
                    patched += 1
                } else {
                    hostRemove(c1[j].el)
                }
             }

             // 得到最长递增子序列 [2, 4, 1] ==> [0, 1]
             const longestIncrementSubsequence = move ? getSequence(newVNodeIndexMapOldVNodeIndex) : []
             // 遍历新的

             /**
              * 为什么需要从后往前便利
              * 跟移动的api有关 insertBefore,如果从前往后遍历，它的下一个节点可能也需要移动
              * 如果从后往前遍历，就是往稳定的序列插入，不会遇到上述的问题
              */
             let k = longestIncrementSubsequence.length - 1
            for (let j = toPatched - 1 ; j >= 0; j -= 1) {
                const anchor = s2 + j + 1 < c2.length ?  c2[s2 + j + 1].el : null
                if (newVNodeIndexMapOldVNodeIndex[j] === -1 ) {
                    // 创建新的元素
                    patch(null, c2[j + s2], container, anchor, parentComponent)
                 } else if (move) {
                    if (longestIncrementSubsequence[k] !== j || k < 0 ) {
                        // 需要移动
                        hostInsert(c2[j + s2].el, anchor, container)
                    } else {
                        // 不需要移动
                        k--
                   }
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
        if (!n1) {
            mountComponent(n2, container, parentComponent)
        } else {
            patchComponent(n1, n2)
        }
    }

    function mountComponent(vnode, container, parentComponent) {
        const instance = vnode.component = createComponentInstance(vnode, parentComponent)
        setupComponent(instance)
        setupRenderEffect(instance, container)
    }

    function patchComponent(n1, n2) {
        /**
         * 更新组件
         * 1: 是否需要更新
         * 2: 重新调用render ==》 effect
         * n1 n2是虚拟节点，如果需要访问对应的实例，因该将虚拟节点跟实例绑定
         * 需要记录更新的虚拟节点，为了将跟新的东西跟新到instance上
         */
        if (objChange(n1.props, n2.props)) {
            const instance = (n2.component = n1.component)
            instance.nextVNode = n2
            instance.update()
        }
    }

    function setupRenderEffect(instance, container) {
       instance.update =  effect(() => {
            if (instance.isMounted) {
                const { proxy, subTree: prevSubTree, nextVNode } = instance
                if (nextVNode) {
                    // 更新props
                    instance.props = nextVNode.props
                    instance.vnode = nextVNode
                    instance.nextVNode = null
                }
                const nextSubTree = instance.render.call(proxy)
                instance.subTree = nextSubTree
                patch(prevSubTree, nextSubTree, prevSubTree.el, null, instance)
            } else {
                const { proxy,  } = instance
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

    function getSequence(arr: number[]): number[] {
        const p = arr.slice();
        const result = [0];
        let i, j, u, v, c;
        const len = arr.length;
        for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
            p[i] = j;
            result.push(i);
            continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
            c = (u + v) >> 1;
            if (arr[result[c]] < arrI) {
                u = c + 1;
            } else {
                v = c;
            }
            }
            if (arrI < arr[result[u]]) {
            if (u > 0) {
                p[i] = result[u - 1];
            }
            result[u] = i;
            }
        }
        }
        u = result.length;
        v = result[u - 1];
        while (u-- > 0) {
        result[u] = v;
        v = p[v];
        }
        return result;
    }
    

