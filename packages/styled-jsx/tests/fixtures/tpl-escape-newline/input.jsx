export default function App() {
  return (
    <div>
      <p>test</p>
      <style jsx>{`
        p {
          content: "line1\nline2";
          background: url("data:image\/svg+xml,<svg\/>");
        }
      `}</style>
    </div>
  );
}
