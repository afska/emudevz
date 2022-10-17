import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { createPortal } from "react-dom";

// portal generator
const useDraggableInPortal = () => {
	const self = useRef({}).current;

	useEffect(() => {
		const div = document.createElement("div");
		div.style.position = "absolute";
		div.style.pointerEvents = "none";
		div.style.top = "0";
		div.style.width = "100%";
		div.style.height = "100%";
		self.elt = div;
		document.body.appendChild(div);
		return () => {
			document.body.removeChild(div);
		};
	}, [self]);

	return (render) => (provided, ...args) => {
		const element = render(provided, ...args);
		if (provided.draggableProps.style.position === "fixed")
			return createPortal(element, self.elt);

		return element;
	};
};

// fake data generator
const getItems = (count) =>
	Array.from({ length: count }, (v, k) => k).map((k) => ({
		id: `item-${k}`,
		content: `item ${k}`,
	}));

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);

	return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
	// some basic styles to make the items look a bit nicer
	userSelect: "none",
	padding: grid * 2,
	margin: `0 ${grid}px 0 0`,

	// change background colour if dragging
	background: isDragging ? "lightgreen" : "grey",

	// styles we need to apply on draggables
	...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
	background: isDraggingOver ? "lightblue" : "lightgrey",
	display: "flex",
	padding: grid,
	overflow: "auto",
});

const HorizontalDragList = (props) => {
	const [items, setItems] = useState(getItems(6));

	const onDragEnd = (result) => {
		// dropped outside the list
		if (!result.destination) return;

		setItems(reorder(items, result.source.index, result.destination.index));
	};

	const renderDraggable = useDraggableInPortal();

	// Normally you would want to split things out into separate components.
	// But in this example everything is just done in one place for simplicity
	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="droppable" direction="horizontal">
				{(provided, snapshot) => (
					<div
						ref={provided.innerRef}
						style={getListStyle(snapshot.isDraggingOver)}
						{...provided.droppableProps}
					>
						{items.map((item, index) => (
							<Draggable key={item.id} draggableId={item.id} index={index}>
								{renderDraggable((provided, snapshot) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										{...provided.dragHandleProps}
										style={getItemStyle(
											snapshot.isDragging,
											provided.draggableProps.style
										)}
									>
										{item.content}
									</div>
								))}
							</Draggable>
						))}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
};

export default HorizontalDragList;
