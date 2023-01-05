import { h } from '../../lib/mini-vue.es.js'
import { ArrayToText } from './arrayToText.js'
import { TextToArray  } from './textToArray.js'
import { TextToText } from './textToText.js' 
import { ArrayToArray } from './arrayToArray.js'
export const App = {
    render() {
        return  h(
            'div', 
            {
                id: 'root',
                class: 'header',
            },
            [ 
                // h(ArrayToText, {}, ''),
                // h(TextToArray),
                // h(TextToText),
                h(ArrayToArray)
            ]
        )
    },
    setup (){
        return {}
    }   
}