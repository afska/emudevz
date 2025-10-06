const { evaluate } = $;

let mainModule;
before(async () => {
  mainModule = await evaluate();
});

it("the file `/code/index.js` exports <an object> containing the `Emulator` class", () => {
  expect(mainModule.default).to.be.an("object");
  expect(mainModule.default).to.include.key("Emulator");
  expect(mainModule.default.Emulator).to.be.a.class;
});

it("`frame()` calls `onFrame` once", () => {
  const { Emulator } = mainModule.default;
  const onFrame = sinon.spy();
  const onSample = sinon.spy();

  const emulator = new Emulator(onFrame, onSample);
  expect(emulator.onFrame).to.equal(onFrame);
  expect(emulator.onSample).to.equal(onSample);

  emulator.should.respondTo("frame");
  emulator.frame();
  expect(onFrame).to.have.been.calledOnce;
});
