'use strict';

const extend = Object.assign;
const isObject = raw => (raw !== null && typeof raw === 'object');
const hasChange = (value1, value2) => !Object.is(value1, value2);
const capitalize = (str) => {
    return str.charAt(0).toLocaleUpperCase() + str.slice(1);
};
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c.toLocaleUpperCase();
    });
};

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOAT_CHILDREN"] = 16] = "SLOAT_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

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

/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-28 09:06:04
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-29 10:17:52
 * @FilePath: \mini-vue-myself\src\reactivity\effect.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
let activeEffect = undefined;
let shouldTrack = false;
class Effect {
    constructor(fn) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        activeEffect = this;
        shouldTrack = true;
        const res = this._fn();
        activeEffect = undefined;
        shouldTrack = false;
        return res;
    }
    stop() {
        // cleanupEffect
        // 去除自身的deps里面的dep有什么用了？ 不应该是去除targetMap里面的吗 指向同一个对象
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    if (effect.onStop)
        effect.onStop();
    effect.deps.forEach(dep => {
        dep.delete(effect);
    });
}
/*
追踪依赖
使用set =〉 key value的方式存储
*/
const targetMap = new Map();
const track = (target, key) => {
    // 如果单纯创建一个reactive对象
    if (!isTracking())
        return;
    let deps = targetMap.get(target);
    if (!deps) {
        deps = new Map();
        targetMap.set(target, deps);
    }
    let dep = deps.get(key);
    if (!dep) {
        dep = new Set();
        deps.set(key, dep);
    }
    trackEffect(dep);
};
const trackEffect = (dep) => {
    // DOWN 被触发了很多次，如果存在就不要触发
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
};
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
const effect = (fn, option) => {
    const _instance = new Effect(fn);
    extend(_instance, option);
    _instance.run();
    const runner = _instance.run.bind(_instance);
    runner.effect = _instance;
    return runner;
};
const isTracking = () => {
    return shouldTrack && activeEffect !== undefined;
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
        if (key === exports.ReactiveFlags.isReactive) {
            return !isReadonly;
        }
        else if (key === exports.ReactiveFlags.isReadonly) {
            return isReadonly;
        }
        if (!isReadonly) {
            track(target, key);
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
exports.ReactiveFlags = void 0;
(function (ReactiveFlags) {
    ReactiveFlags["isReactive"] = "__v_is_reactive";
    ReactiveFlags["isReadonly"] = "__v-is_readonly";
})(exports.ReactiveFlags || (exports.ReactiveFlags = {}));
const reactive = (raw) => {
    return createReactiveObj(raw, mutableHandler);
};
const readonly = (raw) => {
    return createReactiveObj(raw, readonlyMutableHandler);
};
const isReadonly = (value) => {
    return !!value[exports.ReactiveFlags.isReadonly];
};
const shallowReadonly = (raw) => {
    return createReactiveObj(raw, shallowReadonlyMutableHandler);
};
const shallowReactive = (raw) => {
    return createReactiveObj(raw, shallowReadonlyMutableHandler);
};
const isReactive = (value) => {
    return !!value[exports.ReactiveFlags.isReactive];
};
const isProxy = (value) => {
    return isReactive(value) || isReadonly(value);
};
function createReactiveObj(raw, handler) {
    return new Proxy(raw, handler);
}

/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-28 15:27:03
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-29 11:01:55
 * @FilePath: \mini-vue-myself\src\reactivity\ref.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// ref 可以传入单个值
/*
    如果需要响应式的话，需要track 和 trigger
 */
class RefImpl {
    constructor(value) {
        this.dep = new Set();
        this.__v_is_ref = true;
        /*
            如果是一个对象，就完全变成reactive了，虽然会触发本身以及reactive的get，但实现响应式以来的是reactive
            这里是不是可以像reactive一样递归的遍历每一个key
        */
        this._value = isObject(value) ? reactive(value) : value;
        this._raw = value;
    }
    get value() {
        if (isTracking()) {
            trackEffect(this.dep);
        }
        return this._value;
    }
    set value(val) {
        // TODO 这样判断对于对象不起作用？ DOWN
        if (!hasChange(val, this._raw))
            return;
        this._value = isObject(val) ? reactive(val) : val;
        this._raw = val;
        triggerEffect(this.dep);
    }
}
const ref = (value) => {
    return new RefImpl(value);
};
const isRef = (value) => {
    return !!value.__v_is_ref;
};
const unRef = (value) => {
    return isRef(value) ? value.value : value;
};
const proxyRefs = (obj) => {
    // 需要劫持对象的get set
    // TODO 为什么set get 操作不全部用Reflect
    return new Proxy(obj, {
        get(target, key) {
            // 如果这个值是ref
            //    const res = Reflect.get(target, key)
            //    if (isRef(res)) {
            //     return res.value
            //    } else {
            //     return res
            //    }
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            // value也需要判断
            const res = Reflect.get(target, key);
            // if (isRef(res)) {
            //     // 不需要判断是不是响应式对象吗
            //     if (isRef(value)) {
            //        Reflect.set(target, key, value)
            //     } else {
            //         Reflect.set(res, 'value', value)
            //     }
            // } else {
            //     Reflect.set(target, key, value)
            // }
            // return true
            if (isRef(res) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
};

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

let currentInstance = null;
function createComponentInstance(vnode, parent) {
    const instance = {
        vnode,
        props: {},
        setupState: {},
        type: vnode.type,
        emit: () => { },
        provides: parent ? Object.create(parent.provides) : {},
        parent,
        slots: null,
        isMounted: false,
        subTree: null
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
        setCurrentInstance(instance);
        //TODO 也不能全部传入吧，排除css property、event... & props需要用readonly包一下
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponent(instance);
}
function finishComponent(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
function setCurrentInstance(val) {
    currentInstance = val;
}
function getCurrentInstance() {
    return currentInstance;
}

function provide(key, value) {
    const currInstance = getCurrentInstance();
    if (currInstance) {
        let { provides } = currInstance;
        provides[key] = value;
    }
}
function inject(key) {
    const currInstance = getCurrentInstance();
    if (currInstance) {
        const { provides } = currInstance === null || currInstance === void 0 ? void 0 : currInstance.parent;
        return provides[key];
    }
}

function createAppAPI(render) {
    return (rootComponent) => {
        return {
            mount(rootContainer) {
                // 操作vnode
                const vnode = createVnode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement, insert, patchProp } = options;
    function render(vnode, container) {
        patch(null, vnode, container);
    }
    function patch(n1, n2, container, parent) {
        // 如果vnode不是一个虚拟节点, 处理children: ['1', '2']
        //TODO 需要这样做吗
        /*
        如果真的想要渲染一个字符串，用h函数包裹起来 h('', {}, str)
        if (!isObject(vnode)) {
                vnode = createVnode('div',{}, vnode)
            }
        不需要这样做，会创造出过多的dom节点
        **/
        const { type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (n2.shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container);
                }
                else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parent);
                }
                break;
        }
    }
    function processElement(n1, n2, container, parent) {
        if (!n1) {
            mountElement(n2, container);
        }
        else {
            patchElement(n1, n2);
        }
    }
    function mountElement(vnode, container) {
        const { props, children } = vnode;
        // 处理element
        const el = vnode.el = createElement(vnode.type); // document.createElement(vnode.type)
        // props
        for (const key in props) {
            patchProp(el, key, props[key]);
        }
        // children
        if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parent);
        }
        else {
            el.textContent = children;
        }
        //TODO insert()
        insert(el, container);
    }
    function patchElement(n1, n2, container) {
        console.log(n1, n2);
    }
    function mountChildren(vnode, container, parent) {
        vnode.children.forEach(v => {
            patch(null, v, container, parent);
        });
    }
    function processComponent(n1, n2, container, parent) {
        mountComponent(n1, n2, container, parent);
    }
    function mountComponent(n1, n2, container, parent) {
        const instance = createComponentInstance(n2, parent);
        setupComponent(instance);
        setupRenderEffect(instance, container);
    }
    function setupRenderEffect(instance, container) {
        effect(() => {
            if (instance.isMounted) {
                const { proxy, subTree: prevSubTree } = instance;
                const nextSubTree = instance.render.call(proxy);
                patch(prevSubTree, nextSubTree, container, instance);
            }
            else {
                const { proxy } = instance;
                const nextSubTree = instance.render.call(proxy);
                patch(null, nextSubTree, container, instance);
                instance.vnode.el = nextSubTree.el;
                instance.subTree = nextSubTree;
                instance.isMounted = true;
            }
        });
    }
    function processFragment(n1, n2, container, parent) {
        mountChildren(n2, container, parent);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const el = n2.el = document.createTextNode(children);
        container.append(el);
    }
    return {
        createApp: createAppAPI(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}
function insert(el, container) {
    container.append(el);
}
function patchProp(el, key, value) {
    const isEvent = str => /^on[A-Z]/.test(str);
    if (isEvent(key)) {
        const eventName = key.slice(2).toLocaleLowerCase();
        el.addEventListener(eventName, value);
    }
    else {
        el.setAttribute(key, value);
    }
}
const render = createRenderer({ createElement, insert, patchProp });
function createApp(...args) {
    return render.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVnode = createTextVnode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isRef = isRef;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.renderSlots = renderSlots;
exports.shallowReactive = shallowReactive;
exports.shallowReadonly = shallowReadonly;
exports.unRef = unRef;
