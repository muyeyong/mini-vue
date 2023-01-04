import { createRenderer } from '../runtime-core'

 function createElement(type) {
    return document.createElement(type)
}

 function insert(el, container) {
    container.append(el)
}

 function patchProp(el ,key, value) {
     const isEvent = str => /^on[A-Z]/.test(str)
     if (isEvent(key)) {
            const eventName = key.slice(2).toLocaleLowerCase()
            el.addEventListener(eventName, value)
        } else {
            if (value === undefined || value === null) {
                el.removeAttribute(key)
            } else {
                el.setAttribute(key, value)
            }
            
     }
}

const render: any = createRenderer({ createElement, insert, patchProp})


export function createApp(...args) {
    return render.createApp(...args)
}
