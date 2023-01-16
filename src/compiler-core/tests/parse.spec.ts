import { NodeTypes } from "../src/ast"
import { baseParse } from "../src/parse"

describe('parse', () => {
    describe('interpolation', () => {
        test('simple interpolation', () => {
            const ast = baseParse("{{message}}")
            /* 
                {
                    children: [
                        {
                            type: 'interpolation',
                            content: {
                                type: 'simple_expression',
                                content: 'message'
                            }
                        }
                    ]
                }
            **/
           expect(ast.children[0]).toStrictEqual(
            {
                type: NodeTypes.INTERPOLATION,
                content: {
                    type: NodeTypes.SIMPLE_EXPRESSION,
                    content: 'message'
                }
            })
        }),
        test('simple element', () => {
            const ast = baseParse("<div></div>")
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.ELEMENT,
                tag: 'div'
            })
        })
    })
})