const getterMap = {
    '$el' : instance => instance.vnode.el
}

export const publicInstanceProxyHandler = {
    get({_: instance}, key) {
        const { setupState, props = {} } = instance
        if (key in setupState) {
            return setupState[key]
        } else if (key in props) {
            return props[key]
        }
        // 获取this.$el
        const getterResult = getterMap[key]
        if(getterResult) {
            return getterResult(instance)
        }
    }
}