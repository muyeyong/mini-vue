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
    var _a;
    const vnode = {
        type,
        props,
        children,
        key: (_a = props === null || props === void 0 ? void 0 : props.key) !== null && _a !== void 0 ? _a : null,
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
    // slot ??????????????????????????????
    /*
        slot ??????????????????????????????componentSlots?????????????????????slot?????????????????????
        ?????????component???h?????????????????????????????????Array
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
 * @Description: ??????????????????,?????????`customMade`, ??????koroFileHeader???????????? ????????????: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
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
        // ???????????????deps?????????dep?????????????????? ??????????????????targetMap???????????? ?????????????????????
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
????????????
??????set =??? key value???????????????
*/
const targetMap = new Map();
const track = (target, key) => {
    // ????????????????????????reactive??????
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
    // DOWN ???????????????????????????????????????????????????
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
};
/* ???????????? */
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
 * @Description: ??????????????????,?????????`customMade`, ??????koroFileHeader???????????? ????????????: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
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
 * @Description: ??????????????????,?????????`customMade`, ??????koroFileHeader???????????? ????????????: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
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
 * @Description: ??????????????????,?????????`customMade`, ??????koroFileHeader???????????? ????????????: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// ref ?????????????????????
/*
    ????????????????????????????????????track ??? trigger
 */
class RefImpl {
    constructor(value) {
        this.dep = new Set();
        this.__v_is_ref = true;
        /*
            ???????????????????????????????????????reactive?????????????????????????????????reactive???get?????????????????????????????????reactive
            ????????????????????????reactive??????????????????????????????key
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
        // TODO ??????????????????????????????????????? DOWN
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
    // ?????????????????????get set
    // TODO ?????????set get ??????????????????Reflect
    return new Proxy(obj, {
        get(target, key) {
            // ??????????????????ref
            //    const res = Reflect.get(target, key)
            //    if (isRef(res)) {
            //     return res.value
            //    } else {
            //     return res
            //    }
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            // value???????????????
            const res = Reflect.get(target, key);
            // if (isRef(res)) {
            //     // ??????????????????????????????????????????
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
        // ??????this.$el
        const getterResult = getterMap[key];
        if (getterResult) {
            return getterResult(instance);
        }
    },
    // set({_: instance}, key, value) {
    //     console.log(instance, key, value)
    //     console.log(instance.setupState[key] = value)
    //     return true
    // }
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
    // TODO ????????? props slot
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    // ??????setup 
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // ????????????
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandler);
    const { setup } = instance.type;
    if (setup) {
        setCurrentInstance(instance);
        //TODO ?????????????????????????????????css property???event... & props?????????readonly?????????
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
                // ??????vnode
                const vnode = createVnode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, insert: hostInsert, patchProp: hostPatchProp, remove: hostRemove, setElementText: hostSetElementText } = options;
    function render(vnode, container) {
        patch(null, vnode, container);
    }
    function patch(n1, n2, container, anchor = null, parentComponent = null) {
        // ??????vnode????????????????????????, ??????children: ['1', '2']
        //TODO ??????????????????
        /*
        ?????????????????????????????????????????????h?????????????????? h('', {}, str)
        if (!isObject(vnode)) {
                vnode = createVnode('div',{}, vnode)
            }
        ??????????????????????????????????????????dom??????
        **/
        const { type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (n2.shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, anchor, parentComponent);
                }
                else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processElement(n1, n2, container, anchor, parentComponent) {
        if (!n1) {
            mountElement(n2, container, anchor, parentComponent);
        }
        else {
            patchElement(n1, n2, container);
        }
    }
    function mountElement(vnode, container, anchor, parentComponent) {
        const { props, children } = vnode;
        // ??????element
        const el = vnode.el = hostCreateElement(vnode.type);
        // props
        for (const key in props) {
            hostPatchProp(el, key, props[key]);
        }
        // children
        if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parentComponent);
        }
        else {
            hostSetElementText(el, children);
        }
        hostInsert(el, anchor, container);
    }
    function patchElement(n1, n2, container) {
        const oldProps = n1.props;
        const newProps = n2.props;
        const el = n2.el = n1.el;
        patchProps(oldProps, newProps, el);
        patchChildren(n1, n2, container, el);
    }
    function patchProps(oldProps, newProps, el) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                if (oldProps[key] !== newProps[key]) {
                    hostPatchProp(el, key, newProps[key]);
                }
            }
            for (const key in oldProps) {
                if (!(key in newProps)) {
                    hostPatchProp(el, key, null);
                }
            }
        }
    }
    function patchChildren(n1, n2, container, parentComponent) {
        // ????????????
        if (n1.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            if (n2.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
                // Array -> Text
                //1. ??????n1 children
                unmountChildren(n1);
                //2. ??????n2 children
                hostSetElementText(container, n2.children);
            }
            else {
                patchKeyedChildren(n1, n2, container, parentComponent);
            }
        }
        else if (n1.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (n2.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // text -> Array
                // ??????n1 children
                hostSetElementText(container, '');
                mountChildren(n2, container, parentComponent);
            }
            else {
                if (n1.children !== n2.children) {
                    hostSetElementText(container, n2.children);
                }
            }
        }
    }
    function unmountChildren(vnode) {
        const children = vnode.children;
        for (let i = 0; i < children.length; i += 1) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    function patchKeyedChildren(n1, n2, container, parentComponent) {
        let i = 0;
        let e1 = n1.children.length - 1;
        let e2 = n2.children.length - 1;
        const c1 = n1.children;
        const c2 = n2.children;
        const isSameVNode = (n1, n2) => n1.type === n2.type && n1.key === n2.key;
        // ????????????
        while (i <= e1 && i <= e2) {
            if (isSameVNode(c1[i], c2[i])) {
                // ???????????????patch???????????????
                patch(c1[i], c2[i], container, null, parentComponent);
            }
            else {
                break;
            }
            i++;
        }
        // ????????????
        while (i <= e1 && i <= e2) {
            if (isSameVNode(c1[e1], c2[e2])) {
                patch(c1[e1], c2[e2], container, null, parentComponent);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        if (i > e1) {
            if (i <= e2) {
                // ?????????????????????????????????????????????????????????,??????anchor??????
                // i >= e1 + 1 // ??????
                const anchor = i + 1 > c2.length ? null : c2[i + 1].el; // TODO ???????????????????????????
                while (i <= e2) {
                    patch(null, c2[i], container, anchor, parentComponent);
                    i++;
                }
            }
        }
        else if (i > e2) {
            if (i <= e1) {
                while (i <= e1) {
                    hostRemove(c1[i].el, parentComponent);
                    i++;
                }
            }
        }
        else {
            /**
               ???????????????
                   ??????????????????????????????????????????1?????????for??????????????? 2?????????????????? s2 e2???????????????map?????????????????????
                   ?????????????????????????????????
                   ?????????????????? ??????

               ?????????
                   ?????????????????????????????????????????????????????????????????????????????????????????????

            */
            const s1 = i;
            const s2 = i;
            const toPatched = e2 - s2 + 1;
            let patched = 0;
            let prevIndex = -1;
            let move = false;
            const newVNodeMap = new Map();
            // ????????????????????????????????????????????????????????????
            const newVNodeIndexMapOldVNodeIndex = Array(toPatched);
            for (let j = s2; j <= e2; j += 1) {
                newVNodeMap.set(c2[j].key, j);
            }
            for (let j = 0; j < newVNodeIndexMapOldVNodeIndex.length; j += 1) {
                newVNodeIndexMapOldVNodeIndex[j] = -1;
            }
            for (let j = s1; j <= e1; j += 1) {
                if (patched === toPatched) {
                    console.log('??????????????????: ', c1[j]);
                    hostRemove(c1[j].el);
                    continue;
                }
                //TODO if else ????????????????????????
                let newChildIndex;
                // if (c1[i].key !== null && c1[i].key !== undefined) {
                //     newChildIndex = newVNodeMap.get(c1[i].key)
                //     if (newChildIndex !== undefined) { 
                //         // debugger
                //         /** TODO  2023-01-10
                //          * ????????????????????????,  ????????????api
                //          *  1??? c2?????????c2[newChildIndex]???????????????
                //          *  2??? c1??????c1[i]?????????1???????????????????????????
                //          *  ????????????dom?????????
                //          * 
                //          * 2023-01-11
                //          * 1???????????????????????????????????????????????????
                //          * 2????????????dom
                //         */
                //        // ??????????????????props????????????????????????????????????
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
                //DOWN 2023-01-11 if else ?????????????????????
                if (c1[j].key !== null && c1[j].key !== undefined) {
                    newChildIndex = newVNodeMap.get(c1[j].key);
                }
                else {
                    for (let j = s2; j <= e2; j += 1) {
                        if (isSameVNode(c2[j], c1[j])) {
                            newChildIndex = j;
                            break;
                        }
                    }
                }
                if (newChildIndex !== undefined) {
                    //TODO ????????????????????????
                    // ??????????????????????????????????????????
                    if (newChildIndex > prevIndex && !move) {
                        prevIndex = newChildIndex;
                    }
                    else {
                        move = true;
                    }
                    newVNodeIndexMapOldVNodeIndex[newChildIndex - s2] = j;
                    patch(c1[j], c2[newChildIndex], container, null, parentComponent);
                    patched += 1;
                }
                else {
                    hostRemove(c1[j].el);
                }
            }
            // ??????????????????????????? [2, 4, 1] ==> [0, 1]
            const longestIncrementSubsequence = move ? getSequence(newVNodeIndexMapOldVNodeIndex) : [];
            // ????????????
            /**
             * ?????????????????????????????????
             * ????????????api?????? insertBefore,?????????????????????????????????????????????????????????????????????
             * ???????????????????????????????????????????????????????????????????????????????????????
             */
            let k = longestIncrementSubsequence.length - 1;
            for (let j = toPatched - 1; j >= 0; j -= 1) {
                const anchor = s2 + j + 1 < c2.length ? c2[s2 + j + 1].el : null;
                if (newVNodeIndexMapOldVNodeIndex[j] === -1) {
                    // ??????????????????
                    patch(null, c2[j + s2], container, anchor, parentComponent);
                }
                else if (move) {
                    if (longestIncrementSubsequence[k] !== j || k < 0) {
                        // ????????????
                        hostInsert(c2[j + s2].el, anchor, container);
                    }
                    else {
                        // ???????????????
                        k--;
                    }
                }
            }
        }
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(v => {
            patch(null, v, container, null, parentComponent);
        });
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n1, n2, container, parentComponent);
    }
    function mountComponent(n1, n2, container, parentComponent) {
        const instance = createComponentInstance(n2, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, container);
    }
    function setupRenderEffect(instance, container) {
        effect(() => {
            if (instance.isMounted) {
                const { proxy, subTree: prevSubTree } = instance;
                const nextSubTree = instance.render.call(proxy);
                instance.subTree = nextSubTree;
                patch(prevSubTree, nextSubTree, prevSubTree.el, null, instance);
            }
            else {
                const { proxy } = instance;
                const nextSubTree = instance.render.call(proxy);
                patch(null, nextSubTree, container, null, instance);
                instance.vnode.el = nextSubTree.el;
                instance.subTree = nextSubTree;
                instance.isMounted = true;
            }
        });
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
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
function getSequence(arr) {
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
                }
                else {
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

function createElement(type) {
    return document.createElement(type);
}
function insert(el, anchor, parent) {
    // ??? parent.append(el) ?????????????????????????????? parent.insertBefore()
    // parent.append(el)
    parent.insertBefore(el, anchor);
}
function patchProp(el, key, value) {
    const isEvent = str => /^on[A-Z]/.test(str);
    if (isEvent(key)) {
        const eventName = key.slice(2).toLocaleLowerCase();
        el.addEventListener(eventName, value);
    }
    else {
        if (value === undefined || value === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, value);
        }
    }
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const render = createRenderer({ createElement, insert, patchProp, remove, setElementText });
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
