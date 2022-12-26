var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOAT_CHILDREN"] = 16] = "SLOAT_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

const extend = Object.assign;
const isObject = raw => (raw !== null && typeof raw === 'object');
const capitalize = (str) => {
    return str.charAt(0).toLocaleUpperCase() + str.slice(1);
};
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c.toLocaleUpperCase();
    });
};

/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-28 09:06:04
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-29 10:17:52
 * @FilePath: \mini-vue-myself\src\reactivity\effect.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
追踪依赖
使用set =〉 key value的方式存储
*/
const targetMap = new Map();
/* 触发依赖 */
const trigger = (target, key) => {
    const deps = targetMap.get(target);
    const dep = deps.get(key);
    triggerEffect(dep);
};
const triggerEffect = (dep) => {
    for (let f of dep) {
        f.scheduler ? f.scheduler() : f.run();
    }
};

/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-25 14:53:07
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-29 10:56:41
 * @FilePath: \mini-vue-myself\src\reactivity\baseHandler.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const createGetter = (isReadonly = false, shallow = false) => {
    return function get(target, key) {
        if (key === ReactiveFlags.isReactive) {
            return !isReadonly;
        }
        else if (key === ReactiveFlags.isReadonly) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (isObject(res) && !shallow) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
};
const createSetter = () => {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
};
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowGet = createGetter(true, true);
const mutableHandler = {
    get,
    set
};
const readonlyMutableHandler = {
    get: readonlyGet,
    set: function (target, key, value) {
        console.warn(`${target} just readonly`);
        return true;
    }
};
const shallowReadonlyMutableHandler = extend({}, readonlyMutableHandler, {
    get: shallowGet
});
extend({}, mutableHandler, {
    get: shallowGet
});

/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-25 14:53:07
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-28 11:49:16
 * @FilePath: \mini-vue-myself\src\reactivity\reactive.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["isReactive"] = "__v_is_reactive";
    ReactiveFlags["isReadonly"] = "__v-is_readonly";
})(ReactiveFlags || (ReactiveFlags = {}));
const reactive = (raw) => {
    return createReactiveObj(raw, mutableHandler);
};
const readonly = (raw) => {
    return createReactiveObj(raw, readonlyMutableHandler);
};
const shallowReadonly = (raw) => {
    return createReactiveObj(raw, shallowReadonlyMutableHandler);
};
function createReactiveObj(raw, handler) {
    return new Proxy(raw, handler);
}

const emit = (instance, event) => {
    const { props } = instance;
    const handleKey = (event) => {
        return 'on' + capitalize(camelize(event));
    };
    const handler = props[handleKey(event)];
    handler && handler();
};

const initProps = (instance, rawProps) => {
    instance.props = rawProps || {};
};

const initSlots = (instance, children) => {
    if (!(instance.vnode.shapeFlag & ShapeFlags.SLOAT_CHILDREN))
        return;
    const slots = {};
    for (const key in children) {
        const value = children[key];
        if (typeof value === 'function') {
            slots[key] = (props) => normalizeSlotValue(value(props));
        }
        else {
            slots[key] = normalizeSlotValue(value);
        }
    }
    instance.slots = slots;
};
const normalizeSlotValue = (slot) => {
    return Array.isArray(slot) ? slot : [slot];
};

const getterMap = {
    '$el': instance => instance.vnode.el,
    '$slots': instance => instance.slots
};
const publicInstanceProxyHandler = {
    get({ _: instance }, key) {
        const { setupState, props = {} } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        else if (key in props) {
            return props[key];
        }
        // 获取this.$el
        const getterResult = getterMap[key];
        if (getterResult) {
            return getterResult(instance);
        }
    }
};

function createComponentInstance(vnode) {
    const instance = {
        vnode,
        props: {},
        setupState: {},
        type: vnode.type,
        emit: () => { },
        slots: null
    };
    instance.emit = emit.bind(null, instance);
    return instance;
}
function setupComponent(instance) {
    // TODO 初始化 props slot
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    // 处理setup 
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // 代理对象
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandler);
    const { setup } = instance.type;
    if (setup) {
        //TODO 也不能全部传入吧，排除css property、event... & props需要用readonly包一下
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
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

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
const createVnode = (type, props, children) => {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    // component + children is Array
    if ((ShapeFlags.STATEFUL_COMPONENT & vnode.shapeFlag) &&
        (isObject(vnode.children))) {
        vnode.shapeFlag |= ShapeFlags.SLOAT_CHILDREN;
    }
    return vnode;
};
function createTextVnode(children) {
    return createVnode(Text, {}, children);
}
function getShapeFlag(type) {
    if (typeof type === 'string') {
        return ShapeFlags.ELEMENT;
    }
    else if (isObject(type)) {
        return ShapeFlags.STATEFUL_COMPONENT;
    }
    return 0;
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    // 如果vnode不是一个虚拟节点, 处理children: ['1', '2']
    //TODO 需要这样做吗
    /*
    如果真的想要渲染一个字符串，用h函数包裹起来 h('', {}, str)
     if (!isObject(vnode)) {
            vnode = createVnode('div',{}, vnode)
        }
    不需要这样做，会创造出过多的dom节点
    **/
    const { type } = vnode;
    switch (type) {
        case Fragment:
            processFragment(vnode, container);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container);
            }
            else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container);
            }
            break;
    }
}
function processElement(vnode, container) {
    const { props, children } = vnode;
    // 处理element
    const el = vnode.el = document.createElement(vnode.type);
    // props
    for (const key in props) {
        const isEvent = str => /^on[A-Z]/.test(str);
        if (isEvent(key)) {
            const eventName = key.slice(2).toLocaleLowerCase();
            el.addEventListener(eventName, props[key]);
        }
        else {
            el.setAttribute(key, props[key]);
        }
    }
    // children
    if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el);
    }
    else {
        el.textContent = children;
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        patch(v, container);
    });
}
function processComponent(vnode, container) {
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
function processFragment(vnode, container) {
    mountChildren(vnode, container);
}
function processText(vnode, container) {
    const { children } = vnode;
    const el = vnode.el = document.createTextNode(children);
    container.append(el);
}

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

const renderSlots = (slots, key, props) => {
    let slot = slots[key];
    if (typeof slot === 'function') {
        slot = slot(props);
    }
    // slot 本身就是一个虚拟节点
    /*
        slot 为什么是一个数组，在componentSlots进行过处理，将slot全部转换成数组
        如果是component，h函数的第三个参数需要是Array
    **/
    // console.log('slot', slot, h('div', {}, slot))
    return h(Fragment, {}, slot);
};

export { createApp, createTextVnode, h, renderSlots };
