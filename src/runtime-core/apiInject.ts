import { getCurrentInstance } from "./component";

export function provide (key, value) {
    const currInstance: any = getCurrentInstance()
    if (currInstance) {
        let { provides } = currInstance
        provides[key] = value
    }
} 

export function inject (key) {
    const currInstance: any = getCurrentInstance()
    if (currInstance) {
        const { provides } = currInstance?.parent
        return provides[key]
    }
}

