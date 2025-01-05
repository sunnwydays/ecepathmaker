import { FC, useState } from 'react';
import MakerCard from './MakerCard';

import {DndContext, DragEndEvent, UniqueIdentifier} from '@dnd-kit/core';
import Droppable from '../components/Droppable';
import Draggable from '../components/Draggable';
import { CourseCardProps } from '../types/CourseTypes';
import { GridPosition } from '../types/GridTypes';

interface CourseGrid {
    courses: CourseCardProps[];
    positions: Map<string, GridPosition>;
}

const CourseGrid:FC<CourseGrid> = ({ courses, positions }) => {
    const terms = ['3F', '3S', '4F', '4S', 'XX'];
    const slots = ['1', '2', '3', '4', '5';];

    const mockCourse = {
        code: 'ECE456',
        name: 'Test Course',
        preq: ['ECE345'],
        stream1: true,
        onlyF: true,
        isCS: true,
    };

    const [parent, setParent] = useState<UniqueIdentifier>('');

    const draggableItem = (
        <Draggable id="hi">
           <MakerCard {...mockCourse} />
        </Draggable>
    );

    return (
        <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-8">
                <div className="flex flex-col gap-2">
                    <div key={term}>

                    </div>
                    {terms.map((term) => (
                        <div key={term[0]} className="flex items-center gap-2">
                            {term.map((id) => (
                                <Droppable key={id} id={id}>
                                    {parent === id ? draggableItem : id}
                                </Droppable>
                            ))}
                        </div>
                    ))}
                </div>
            <div>
                <h2 className="mb-8 text-xl font-semibold">👈 Drag courses into the grid</h2>
                {parent === '' && draggableItem}
            </div>
        </div>
    </DndContext>
    );
};

export default CourseGrid;