import React from "react";
import Tooltip from "../gui/components/widgets/Tooltip";
import locales from "../locales";
import styles from "./AlphaColorInput.module.css";

export default function AlphaColorInput({
	value,
	defaultValue,
	onChange,
	onReset,
	style,
	label,
}) {
	const baseColor = value || defaultValue || "#000000";
	const { rgb, alpha } = parseHexWithAlpha(
		baseColor,
		defaultValue || "#000000"
	);
	const inputRef = React.useRef(null);
	const containerRef = React.useRef(null);
	const [isDragging, setIsDragging] = React.useState(false);
	const dragStateRef = React.useRef({
		startX: 0,
		startY: 0,
		hasDragged: false,
	});

	const updateAlphaFromEvent = (event) => {
		if (!containerRef.current) return;

		const rect = containerRef.current.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const deltaX = event.clientX - centerX;
		const deltaY = event.clientY - centerY;

		if (deltaX === 0 && deltaY === 0) return;

		// top = 0%, clockwise increases to 100%
		let angle = Math.atan2(deltaY, deltaX); // -PI..PI, 0 = +X axis
		angle += Math.PI / 2; // rotate so top is 0
		if (angle < 0) angle += Math.PI * 2;

		let t = angle / (Math.PI * 2); // 0..1

		// magnetize to 100% alpha when close to the top
		if (t > 0.9) t = 1;

		onChange(makeHexWithAlpha(rgb, t));
	};

	React.useEffect(() => {
		if (!isDragging) return;

		const handleMove = (event) => {
			event.preventDefault();
			const dragState = dragStateRef.current;
			if (!dragState) return;

			const deltaX = event.clientX - dragState.startX;
			const deltaY = event.clientY - dragState.startY;
			const distanceSquared = deltaX * deltaX + deltaY * deltaY;

			if (!dragState.hasDragged && distanceSquared > 4 * 4)
				dragState.hasDragged = true;

			if (dragState.hasDragged) updateAlphaFromEvent(event);
		};

		const handleUp = () => {
			const dragState = dragStateRef.current;
			if (dragState && !dragState.hasDragged) {
				// treat as a click (open color picker)
				if (inputRef.current) inputRef.current.click();
			}
			setIsDragging(false);
		};

		window.addEventListener("mousemove", handleMove);
		window.addEventListener("mouseup", handleUp);

		return () => {
			window.removeEventListener("mousemove", handleMove);
			window.removeEventListener("mouseup", handleUp);
		};
	}, [isDragging, rgb, alpha, onChange]);

	const handleMouseDown = (event) => {
		if (event.button !== 0) return;

		event.preventDefault();
		dragStateRef.current = {
			startX: event.clientX,
			startY: event.clientY,
			hasDragged: false,
		};
		setIsDragging(true);
	};

	const handleContextMenu = (event) => {
		event.preventDefault();
		if (onReset) onReset();
	};

	const handleColorChange = (event) => {
		const newRgb = event.target.value; // #rrggbb from native picker
		onChange(makeHexWithAlpha(newRgb, alpha));
	};

	const previewHex = makeHexWithAlpha(rgb, alpha);
	const size = 28;
	const radius = size / 2 - 4;
	const center = size / 2;
	const angle = alpha * Math.PI * 2 - Math.PI / 2; // 0 at top, clockwise
	const handleX = center + Math.cos(angle) * radius;
	const handleY = center + Math.sin(angle) * radius;

	const baseTitle = `${locales.get("opacity")}: ${Math.round(alpha * 100)}%`;
	const title = label ? `${label} - ${baseTitle}` : baseTitle;

	return (
		<Tooltip title={title} placement="top">
			<div
				ref={containerRef}
				onMouseDown={handleMouseDown}
				onContextMenu={handleContextMenu}
				className={styles.container}
				style={{ backgroundColor: previewHex, ...(style || {}) }}
			>
				<input
					ref={inputRef}
					type="color"
					value={rgb}
					onChange={handleColorChange}
					className={styles.hiddenColorInput}
				/>
				<div
					className={styles.knob}
					style={{
						left: handleX - 3,
						top: handleY - 3,
					}}
				/>
			</div>
		</Tooltip>
	);
}

function parseHexWithAlpha(value, fallbackHex = "#000000") {
	if (typeof value !== "string" || !value.startsWith("#"))
		return { rgb: fallbackHex, alpha: 1 };

	const body = value.slice(1);
	const hex = body.toLowerCase();

	// #rrggbbaa
	if (hex.length === 8) {
		const rgb = `#${hex.slice(0, 6)}`;
		const alphaByte = parseInt(hex.slice(6, 8), 16);
		const alpha =
			Number.isNaN(alphaByte) || alphaByte == null
				? 1
				: Math.max(0, Math.min(255, alphaByte)) / 255;
		return { rgb, alpha };
	}

	// #rrggbb
	if (hex.length === 6) {
		return { rgb: `#${hex}`, alpha: 1 };
	}

	// #rgba
	if (hex.length === 4) {
		const [r, g, b, alphaChar] = hex;
		const rgb = `#${r}${r}${g}${g}${b}${b}`;
		const alphaByte = parseInt(`${alphaChar}${alphaChar}`, 16);
		const alpha =
			Number.isNaN(alphaByte) || alphaByte == null
				? 1
				: Math.max(0, Math.min(255, alphaByte)) / 255;
		return { rgb, alpha };
	}

	// #rgb
	if (hex.length === 3) {
		const [r, g, b] = hex;
		const rgb = `#${r}${r}${g}${g}${b}${b}`;
		return { rgb, alpha: 1 };
	}

	return { rgb: fallbackHex, alpha: 1 };
}

function makeHexWithAlpha(rgb, alpha) {
	// rgb is assumed to be #rrggbb
	if (typeof rgb !== "string" || !/^#[0-9a-fA-F]{6}$/.test(rgb))
		rgb = "#000000";
	const clampedAlpha = Math.max(0, Math.min(1, Number(alpha) || 0));
	const alphaByte = Math.round(clampedAlpha * 255);
	const alphaHex = alphaByte.toString(16).padStart(2, "0");
	return `${rgb.toLowerCase()}${alphaHex}`;
}
