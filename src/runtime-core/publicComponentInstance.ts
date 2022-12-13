const getterMap = {
    '$el' : instance => instance.vnode.el
}

export const publicInstanceProxyHandler = {
    get({_: instance}, key) {
        const { setupState } = instance
        if (key in setupState) {
            return setupState[key]
        }
        // 获取this.$el
        const getterResult = getterMap[key]
        if(getterResult) {
            return getterResult(instance)
        }
    }
}