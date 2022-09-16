import React, { useEffect, useRef } from "react";
import { Panzoom as NativePanzoom } from "@fancyapps/ui/dist/panzoom.esm.js";
import "@fancyapps/ui/dist/panzoom.controls.css";
import "@fancyapps/ui/dist/panzoom.css";

// DISABLED: Controls
// import { Controls } from "@fancyapps/ui/dist/panzoom.controls.esm.js";
// NativePanzoom.Plugins = {
// 	Controls,
// };

function ReactPanzoom(props) {
	const wrapper = useRef(null);

	useEffect(() => {
		const instance = new NativePanzoom(wrapper.current, props.options || {});

		return () => {
			instance.destroy();
		};
	}, [props.options]);

	return (
		<div
			className="panzoom"
			style={{ width: "100%", height: "100%" }}
			ref={wrapper}
		>
			<img className="panzoom__content" src={props.src} alt="panzoom" />
		</div>
	);
}

export default ReactPanzoom;
