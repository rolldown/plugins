const COLOR = "red";

export default () => (
  <div>
    <p>test</p>
    <style jsx>{`
      p { font-size: 14px; }
    `}</style>
    <style jsx>{`
      p { color: ${COLOR}; }
    `}</style>
  </div>
);
