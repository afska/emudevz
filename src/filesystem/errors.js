const common = { isFilesystemEvent: true };

export const PERMISSION_DENIED = { code: "permission_denied", ...common };
export const ENTRY_ALREADY_EXISTS = { code: "entry_already_exists", ...common };
export const ENTRY_NOT_FOUND = { code: "entry_not_found", ...common };
