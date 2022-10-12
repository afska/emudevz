module.exports = {
	$cwd: "/",
	$setCwd: (cwd) => {
		this.$cwd = cwd;
	},
	cwd: () => this.$cwd,
};
