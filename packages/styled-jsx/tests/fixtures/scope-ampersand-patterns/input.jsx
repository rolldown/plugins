import css from 'styled-jsx/css'

// Top-level & with additional class — &.foo should become .foo.jsx-HASH
export const s1 = css`
  &.active {
    color: blue;
  }
`

// Top-level & with pseudo-class — &:hover should become .jsx-HASH:hover
export const s2 = css`
  &:hover {
    opacity: 0.8;
  }
`

// Top-level & with pseudo-element — &::before should become .jsx-HASH::before
export const s3 = css`
  &::before {
    content: '';
  }
`

// Top-level & with :not() — &:not(.foo) should become .jsx-HASH:not(.foo)
export const s4 = css`
  &:not(.disabled) {
    cursor: pointer;
  }
`

// Top-level & with combined class + pseudo — &.foo:hover should become .foo.jsx-HASH:hover
export const s5 = css`
  &.active:hover {
    color: green;
  }
`

// Top-level &:global(.foo) (no space) — :scope before :global should be stripped
export const s6 = css`
  &:global(.theme-dark) {
    background: black;
  }
`

// Adjacent sibling via & — & + .sibling should work
export const s7 = css`
  & + .sibling {
    margin-left: 8px;
  }
`

// Top-level & alone — already covered by issue-94 but verify
export const s8 = css`
  & {
    display: block;
  }
`
