import React from "react";

function PanZoom(props) {
	return (
		<img
			src={props.src}
			alt="content"
			style={{
				userSelect: "none",
				pointerEvents: "none",
				width: "100%",
				height: "100%",
				objectFit: "contain",
			}}
		/>
	);
}

export default PanZoom;
