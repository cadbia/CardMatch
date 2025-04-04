import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface PreferenceItemProps {
  id: string;
  label: string;
  isAdvanced?: boolean;
}

export function PreferenceItem({ id, label, isAdvanced }: PreferenceItemProps) {
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
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-3 bg-white border rounded-lg mb-2 ${
        isDragging ? 'shadow-lg border-indigo-300' : 'border-gray-200'
      } ${isAdvanced ? 'bg-indigo-50' : ''}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mr-3 touch-none"
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </button>
      <span className="text-sm text-gray-700">{label}</span>
      {isAdvanced && (
        <span className="ml-auto text-xs text-indigo-600 font-medium">Advanced</span>
      )}
    </div>
  );
}