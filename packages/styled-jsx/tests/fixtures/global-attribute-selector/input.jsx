export default () => (
  <div>
    <p>test</p>
    <style jsx>{`
      :global([data-theme="dark"]) p {
        color: white;
      }
      :global(a[href="https://example.com"]) {
        color: blue;
      }
    `}</style>
  </div>
);
