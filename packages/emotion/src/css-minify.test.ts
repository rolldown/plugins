import { expect, test } from 'vitest'
import { minifyCSSString } from './css-minify'

const tests: Record<
  string,
  { input: { css: string; isFirst?: boolean; isLast?: boolean }; output: string }
> = {
  'should not trim end space in first item': {
    input: { css: '\nbox-shadow: inset 0px 0px 0px ', isFirst: true, isLast: false },
    output: 'box-shadow:inset 0px 0px 0px ',
  },
  'should minify single line comment correctly': {
    input: { css: '//comment;\ncolor: red;//comment\nbackground-image:url(http://dummy-url)' },
    output: 'color:red;background-image:url(http://dummy-url)',
  },
  'should remove comments': {
    input: {
      css: 'color: red;/*comment\ncomments*/background-image:url(http://dummy-url).foo{/*comments\n*/\n}',
    },
    output: 'color:red;background-image:url(http://dummy-url).foo{}',
  },
  'issue 258 should preserve url starting with two slashes 1': {
    input: { css: "background-image: url('//domain.com/image.png');" },
    output: "background-image:url('//domain.com/image.png');",
  },
  'issue 258 should preserve url starting with two slashes 2': {
    input: { css: 'background-image: url("//domain.com/image.png");' },
    output: 'background-image:url("//domain.com/image.png");',
  },
}

for (const [name, { input, output }] of Object.entries(tests)) {
  test(name, () => {
    const result = minifyCSSString(input.css, input.isFirst ?? true, input.isLast ?? false)
    expect(result).toBe(output)
  })
}
