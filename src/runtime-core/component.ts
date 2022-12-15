import { shallowReadonly } from "../reactivity/reactive"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandler } from "./publicComponentInstance"
import { createVnode } from "./vnode"

export function createComponentInstance(vnode: any) {
    return {
        vnode,
        props: {},
        setupState: {},
        type: vnode.type
    }
}

export function setupComponent(instance: any) {
    // TODO 初始化 props slot
    initProps(instance, instance.vnode.props)
    // 处理setup 
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
    // 代理对象
    instance.proxy = new Proxy({_: instance}, publicInstanceProxyHandler)
   const { setup } = instance.type
   if (setup) {
        //TODO 也不能全部传入吧，排除css property、event... & props需要用readonly包一下
        const setupResult = setup(shallowReadonly(instance.props))
        handleSetupResult(instance, setupResult)
   }
}
function handleSetupResult(instance: any, setupResult: any) {
   if (typeof setupResult === 'object') {
        instance.setupState = setupResult
   }
   finishComponent(instance)
}

function finishComponent(instance: any) {
    const Component = instance.type
    if (Component.render) {
        instance.render = Component.render
    }
}

