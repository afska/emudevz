module.exports = {
	// path
	$cwd: "/",
	$setCwd: (cwd) => {
		this.$cwd = cwd;
	},
	cwd: () => this.$cwd,

	// esLint
	stderr: {
		fd: 2,
	},
};
