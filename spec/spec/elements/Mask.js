/* globals describe, expect, it, spyOn, jasmine, container */

import { Mask, SVG, Container, Rect } from '../../../src/main.js'

const { any } = jasmine

describe('Mask.js', () => {
  describe('()', () => {
    it('creates a new object of type Mask', () => {
      expect(new Mask()).toEqual(any(Mask))
    })

    it('sets passed attributes on the element', () => {
      expect(new Mask({ id: 'foo' }).id()).toBe('foo')
    })
  })

  describe('remove()', () => {
    it('unmasks all targets', () => {
      const canvas = SVG().addTo(container)
      const mask = canvas.mask()
      const rect = canvas.rect(100, 100).maskWith(mask)
      expect(mask.remove()).toBe(mask)
      expect(rect.masker()).toBe(null)
    })

    it('leaves targets of an overlapping mask ID untouched', () => {
      const canvas = SVG().addTo(container)
      const mask = canvas.mask().id('a')
      const otherMask = canvas.mask().id('aa')
      const rect = canvas.rect(100, 100).maskWith(mask)
      const otherRect = canvas.rect(100, 100).maskWith(otherMask)

      expect(mask.targets()).toEqual([rect])
      mask.remove()

      expect(rect.masker()).toBe(null)
      expect(otherRect.masker()).toBe(otherMask)
    })

    it('calls remove on parent class', () => {
      const mask = new Mask()
      const spy = spyOn(Container.prototype, 'remove')
      mask.remove()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('targets()', () => {
    it('gets all targets of this maskPath', () => {
      const canvas = SVG().addTo(container)
      const mask = canvas.mask()
      const rect = canvas.rect(100, 100).maskWith(mask)
      expect(mask.targets()).toEqual([rect])
    })

    it('matches CSS-special IDs exactly', () => {
      const canvas = SVG().addTo(container)
      const mask = canvas.mask().id('mask.with:special[chars]')
      const rect = canvas.rect(100, 100).maskWith(mask)

      expect(mask.targets()).toEqual([rect])
    })
  })

  describe('Container', () => {
    describe('mask()', () => {
      it('creates a maskPath in the defs', () => {
        const canvas = SVG()
        const mask = canvas.mask()
        expect(mask).toEqual(any(Mask))
        expect(canvas.defs().children()).toEqual([mask])
      })
    })
  })

  describe('Element', () => {
    describe('masker()', () => {
      it('returns the instance of Mask the current element is masked with', () => {
        const canvas = SVG().addTo(container)
        const mask = canvas.mask()
        const rect = canvas.rect(100, 100).maskWith(mask)
        expect(rect.masker()).toEqual(mask)
      })

      it('returns null if no maskPath was found', () => {
        expect(new Rect().masker()).toBe(null)
      })
    })

    describe('maskWith()', () => {
      it('sets the mask attribute on the element to the id of the maskPath', () => {
        const mask = new Mask().id('foo')
        const rect = new Rect().maskWith(mask)
        expect(rect.attr('mask')).toBe('url(#foo)')
      })

      it('creates a maskPath and appends the passed element to it to mask current element', () => {
        const canvas = SVG().addTo(container)
        const circle = canvas.circle(40)
        const rect = canvas.rect(100, 100).maskWith(circle)
        expect(circle.parent()).toEqual(any(Mask))
        expect(rect.attr('mask')).toBe(`url(#${circle.parent().id()})`)
      })
    })

    describe('unmask()', () => {
      it('sets the mask-target attribute to null and returns itself', () => {
        const mask = new Mask().id('foo')
        const rect = new Rect().maskWith(mask)
        expect(rect.unmask()).toBe(rect)
        expect(rect.attr('mask')).toBe(undefined)
      })
    })
  })
})
