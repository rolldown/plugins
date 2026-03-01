// https://github.com/emotion-js/emotion/blob/main/packages/babel-plugin/__tests__/css-macro/__fixtures__/label-object.js

import { css } from '@emotion/react'

export const thing = {
  thisShouldBeTheLabel: css`
    color: hotpink;
  `,
  // prettier-ignore
  'shouldBeAnotherLabel':css`
    color:green;
  `,
}
