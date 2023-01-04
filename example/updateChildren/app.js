import { h } from '../../lib/mini-vue.es.js'
import { ArrayToText } from './arrayToText.js'
export const App = {
    render() {
        return  h(
            'div', 
            {
                id: 'root',
                class: 'header',
            },
            [ 
                h(ArrayToText, {}, '')
            ]
        )
    },
    setup (){
        return {}
    }   
}