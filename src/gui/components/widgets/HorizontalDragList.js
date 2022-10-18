import React, { useEffect, useRef } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { createPortal } from "react-dom";

const HorizontalDragList = ({ items, onSort }) => {
	const onDragEnd = (result) => {
		if (!result.destination) return;
		onSort(reorder(items, result.source.index, result.destination.index));
	};

	const renderDraggable = useDraggableInPortal();

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="droppable" direction="horizontal">
				{(provided, snapshot) => (
					<div
						ref={provided.innerRef}
						style={{ display: "flex", overflow: "auto" }}
						tabIndex={-1}
						{...provided.droppableProps}
					>
						{items.map((item, index) => (
							<Draggable key={item.id} draggableId={item.id} index={index}>
								{renderDraggable((provided, snapshot) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										{...provided.dragHandleProps}
										tabIndex={-1}
										style={{
											userSelect: "none",
											...provided.draggableProps.style,
										}}
									>
										{item.render(snapshot.isDragging, index)}
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

const reorder = (list, startIndex, endIndex) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);

	return result;
};

export default HorizontalDragList;
