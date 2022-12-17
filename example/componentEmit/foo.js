import { h } from '../../lib/mini-vue.es.js'

export const Foo = {
    setup(props, { emit }) {
        console.log('props 233', props)
        const handleClick = () => {
            console.log('child clicked')
            emit('add')
            emit('add-count')
        }
        return { handleClick }
        // props.count++
    },
    render() {
        return h('div', {}, [
            h('div', {}, 'foo props' + this.count),
            h('button', {
                onClick: this.handleClick
            }, 'clickMe')
        ])
    },
}