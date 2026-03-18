import React from 'react';
import styled from '@emotion/styled';

const styleProps = () => ({ display: 'inline-block' });

// Trailing comma after the component argument in styled(Component,)(styles)
// This pattern is common in .tsx files where a generic follows:
//   styled(Component,)<Props>(styles)
// The trailing comma disambiguates the generic from JSX.
export const Icon = styled(
  React.forwardRef<SVGSVGElement, { className?: string }>(({ className }, ref) => (
    <svg ref={ref} className={className} />
  )),
)(styleProps);
