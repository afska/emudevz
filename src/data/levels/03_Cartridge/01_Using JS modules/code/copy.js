[
	["NEEEStest.neees", true],
	["golden.log", false],
	["hello_world.neees", true],
	["240p_test_suite.neees", true],
	["ppu_emphasis.neees", true],
	["ppu_mapper_irq.neees", true],
].forEach(([file, binary]) => {
	const path = `${Drive.TESTROMS_DIR}/${file}`;
	filesystem.write(path, level.bin[file], { binary });
});

[
	"Bobl.neees",
	"Crowborg.neees",
	"DizzySheepDisaster.neees",
	"DreamDogDilemma.neees",
	"FilthyKitchen.neees",
	"Heist.neees",
	"Isostasy.neees",
	"JupiterScope2.neees",
	"MissingLands.neees",
	"Nalleland.neees",
	"RavensGate.neees",
	"RoboNinjaClimb.neees",
	"Spacegulls.neees",
	"StarPowerDemo.neees",
	"SuperTiltBro.neees",
	"TeslaVsEdison.neees",
	"Thwaite.neees",
	"TroubleAt2A03.neees",
	"Wolfling.neees",
	"WolfSpirit.neees",
].forEach((file) => {
	const path = `${Drive.ALLROMS_DIR}/${file}`;
	filesystem.write(path, level.bin[file], { binary: true });
});
