/* globals describe, expect, it, pending */

import { setOuterHTML } from '../../../src/polyfills/innerHTML.js'
import { getWindow } from '../../../src/utils/window.js'
import { svg } from '../../../src/modules/core/namespaces.js'

function setupDocument() {
  const window = getWindow()

  if (typeof window.DOMParser !== 'function') {
    pending('DOMParser is not supported')
  }

  const document = window.document
  const parent = document.createElementNS(svg, 'svg')
  const original = document.createElementNS(svg, 'g')
  original.appendChild(document.createElementNS(svg, 'rect'))
  parent.appendChild(original)

  return { document, original, parent }
}

describe('innerHTML polyfill', () => {
  describe('setOuterHTML()', () => {
    it('replaces the original with every parsed node', () => {
      const { original, parent } = setupDocument()

      setOuterHTML(original, '<circle id="first"/><path id="second"/>')

      expect([...parent.children].map((node) => node.localName)).toEqual([
        'circle',
        'path'
      ])
      expect(parent.querySelector('#first')).not.toBeNull()
      expect(parent.querySelector('#second')).not.toBeNull()
      expect(original.parentNode).toBeNull()
    })

    it('does not change a detached node', () => {
      const { original, parent } = setupDocument()
      parent.removeChild(original)
      const child = original.firstChild

      expect(() => setOuterHTML(original, '<circle/>')).not.toThrow()
      expect(original.firstChild).toBe(child)
      expect(child.parentNode).toBe(original)
    })

    it('leaves the original subtree intact when parsing fails', () => {
      const { original, parent } = setupDocument()
      const child = original.firstChild

      expect(() => setOuterHTML(original, '<circle>')).toThrowError(
        'Can not set outerHTML on node'
      )
      expect(parent.firstChild).toBe(original)
      expect(original.firstChild).toBe(child)
      expect(child.parentNode).toBe(original)
    })
  })
})
