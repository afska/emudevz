const { evaluate, filesystem } = $;

let mainModule;
beforeEach(async () => {
	mainModule = await evaluate();
});
