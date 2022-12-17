import { camelize, capitalize } from "../shared/index"

export const emit = (instance, event: string) => {
    const { props } = instance
    const handleKey = (event) => {
        return 'on' + capitalize(camelize(event)) 
    }
    const handler = props[handleKey(event)]
    handler && handler()
   
}