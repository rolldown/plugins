import styled from "@emotion/styled";

export const MyComponent = styled('div')(
  { color: 'red' },
);

export const MyComponent2 = styled('div')(
  { color: 'red' },
  { target: 'x', },
);
