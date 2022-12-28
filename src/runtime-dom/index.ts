import { createRenderer } from '../runtime-core'

 function createElement(type) {
    return document.createElement(type)
}

 function insert(el, container) {
    container.append(el)
}

 function patchProps(el ,key, value) {
     const isEvent = str => /^on[A-Z]/.test(str)
     if (isEvent(key)) {
            const eventName = key.slice(2).toLocaleLowerCase()
            el.addEventListener(eventName, value)
        } else {
            el.setAttribute(key, value)
     }
}

const render: any = createRenderer({ createElement, insert, patchProps})


export function createApp(...args) {
    return render.createApp(...args)
}
