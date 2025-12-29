import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ImageOption {
  url: string;
  label?: string;
}

interface ImageChoiceRendererProps {
  options: ImageOption[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  multiple?: boolean;
}

const ImageChoiceRenderer: React.FC<ImageChoiceRendererProps> = ({
  options,
  value,
  onChange,
  disabled,
  multiple,
}) => {
  const selectedImage = Array.isArray(value) ? value : [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {options.map((imgOpt: ImageOption, i: number) => (
        <div
          key={i}
          className={cn(
            "relative border rounded-lg overflow-hidden cursor-pointer",
            "hover:shadow-lg transition-shadow duration-200",
            selectedImage.includes(imgOpt.url) ? 'border-primary ring-2 ring-primary' : 'border-gray-200'
          )}
          onClick={() => {
            if (disabled) return;
            let nextSelection;
            if (multiple) {
              nextSelection = selectedImage.includes(imgOpt.url)
                ? selectedImage.filter((url: string) => url !== imgOpt.url)
                : [...selectedImage, imgOpt.url];
            } else {
              nextSelection = selectedImage.includes(imgOpt.url) ? [] : [imgOpt.url];
            }
            onChange(nextSelection);
          }}
        >
          <img src={imgOpt.url} alt={imgOpt.label || 'Image option'} className="w-full h-32 object-cover" />
          {imgOpt.label && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
              {imgOpt.label}
            </div>
          )}
          {selectedImage.includes(imgOpt.url) && (
            <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
              <X className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageChoiceRenderer;