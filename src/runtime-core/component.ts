import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { initSlots } from "./componentSlot"
import { publicInstanceProxyHandler } from "./publicComponentInstance"

let currentInstance = null

export function createComponentInstance(vnode: any, parent) {
   const instance =  {
        vnode,
        props: {},
        setupState: {},
        type: vnode.type,
        emit: () => {},
        provides: parent ? Object.create(parent.provides) : {}, // 原型链指向构造函数,怎么指向
        parent,
        slots: null
    }
    console.log(instance.provides, parent?.provides)
    instance.emit = emit.bind(null, instance) as any
    return instance
}

export function setupComponent(instance: any) {
    // TODO 初始化 props slot
    initProps(instance, instance.vnode.props)
    initSlots(instance, instance.vnode.children)
    // 处理setup 
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
    // 代理对象
    instance.proxy = new Proxy({_: instance}, publicInstanceProxyHandler)
   const { setup } = instance.type
   if (setup) {
        setCurrentInstance(instance)
        //TODO 也不能全部传入吧，排除css property、event... & props需要用readonly包一下
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        })
        setCurrentInstance(null)
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

function setCurrentInstance(val) {
    currentInstance = val
}

export function getCurrentInstance() {
    return currentInstance
}
