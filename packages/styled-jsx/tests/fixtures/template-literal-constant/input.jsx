const color = `red`;
const size = `680px`;

export default function TemplateLiteralConstant() {
  return (
    <div>
      {/* const initialized with template literal should be treated as constant */}
      <style jsx>{`
        p {
          color: ${color};
        }
      `}</style>
      {/* inline template literal expression should be inlined as static */}
      <style jsx>{`
        p {
          color: ${`blue`};
        }
      `}</style>
      {/* mixed: const template literal binding + inline template literal */}
      <style jsx>{`
        @media (min-width: ${size}) {
          p {
            color: ${`green`};
          }
        }
      `}</style>
    </div>
  )
}
