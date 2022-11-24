import { track, trigger } from './effect'

const createGetter = (isReadonly = false) => {
    return function get(target, key) {
        if (!isReadonly) {
            track(target, key)
        }
        return Reflect.get(target, key)
    }
}
const createSetter = () => {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value)
        trigger(target, key)
        return res
    }
}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

const mutableHandler = {
    get,
    set
}

const readonlymutableHandler = {
    get: readonlyGet,
    set: function(target, key, value) {
        console.warn(`${target} just readonly`)
        return true
    }
}

export {
    mutableHandler,
    readonlymutableHandler
}