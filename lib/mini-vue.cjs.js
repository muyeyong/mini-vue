'use strict';

const isObject = raw => (raw !== null && typeof raw === 'object');

const getterMap = {
    '$el': instance => instance.vnode.el
};
const publicInstanceProxyHandler = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        // 获取this.$el
        const getterResult = getterMap[key];
        if (getterResult) {
            return getterResult(instance);
        }
    }
};

function createComponentInstance(vnode) {
    return {
        vnode,
        type: vnode.type
    };
}
function setupComponent(instance) {
    // TODO 初始化 props slot
    // 处理setup 
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // 代理对象
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandler);
    const { setup } = instance.type;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponent(instance);
}
function finishComponent(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    if (typeof vnode.type === 'string') {
        const { props, children } = vnode;
        // 处理element
        const el = vnode.el = document.createElement(vnode.type);
        // props
        for (const key in props) {
            el.setAttribute(key, props[key]);
        }
        // children
        if (Array.isArray(children)) {
            children.forEach(v => {
                patch(v, el);
            });
        }
        else {
            el.textContent = children;
        }
        container.append(el);
    }
    else if (isObject(vnode.type)) {
        // 处理component
        precessComponent(vnode, container);
    }
}
function precessComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    instance.vnode.el = subTree.el;
}

const createVnode = (type, props, children) => {
    return {
        type,
        props,
        children,
        el: null
    };
};

const createApp = (rootComponent) => {
    return {
        mount(rootContainer) {
            // 操作vnode
            const vnode = createVnode(rootComponent);
            render(vnode, rootContainer);
        }
    };
};

function h(type, props, children) {
    return createVnode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
