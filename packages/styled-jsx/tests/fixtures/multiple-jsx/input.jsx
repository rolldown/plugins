const attrs = {
  id: "test",
};

export const Test1 = () => (
  <div>
    <span {...attrs} data-test="test">
      test
    </span>
    <Component />
    <style jsx>{`
      span {
        color: red;
      }
    `}</style>
  </div>
);

export const Test2 = () => <span>test</span>;

export const Test3 = () => (
  <div>
    <span>test</span>
    <style jsx>{`
      span {
        color: red;
      }
    `}</style>
  </div>
);

export default class {
  render() {
    return (
      <div>
        <p>test</p>
        <style jsx>{`
          p {
            color: red;
          }
        `}</style>
      </div>
    );
  }
}
