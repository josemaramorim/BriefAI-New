import * as React from "react"
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BlockEditor from '../components/BlockEditor';
import { Button } from '../components/ui/button';
import { Menu } from 'lucide-react';

interface Block {
  id?: string;
  title: string;
  description?: string;
  order: number;
  parentId?: string | null;
  questions: any[];
}

interface SortableBlockProps {
  id: string;
  index: number;
  block: Block;
  onUpdate: (block: Block) => void;
  onRemove: () => void;
  disabled?: boolean;
}

const SortableBlock: React.FC<SortableBlockProps> = ({ id, index, block, onUpdate, onRemove, disabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative border rounded-md bg-card shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="icon" {...attributes} {...listeners} disabled={disabled}>
          <Menu className="h-4 w-4" />
        </Button>
        <span className="font-semibold text-base">{block.title && block.title.trim() ? block.title : `Bloco ${Number.isFinite(index) ? index + 1 : ''}`}</span>
        <Button variant="ghost" size="icon" onClick={onRemove} disabled={disabled} className="ml-auto text-red-500">
          ×
        </Button>
      </div>
      <BlockEditor block={block} index={index} onUpdate={onUpdate} onRemove={onRemove} disabled={disabled} />
    </div>
  );
};

export default SortableBlock;
