const common = { isUserEvent: true };

export const CANCELED = { code: "canceled", ...common }; // Just cancels the input
export const INTERRUPTED = { code: "interrupted", ...common }; // Closes the program and returns to the shell
export const DISPOSED = { code: "disposed", ...common }; // Terminal UI was unloaded, nothing else matters...
