import React, { useRef, useState, useCallback } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { Button } from './Button';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, selectedImage, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelected(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  if (selectedImage) {
    return (
      <div className="relative group w-full h-64 md:h-96 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
        <img 
          src={selectedImage} 
          alt="Selected" 
          className="max-w-full max-h-full object-contain" 
        />
        <div className="absolute top-2 right-2">
           <Button variant="secondary" onClick={onClear} className="!p-2 rounded-full opacity-70 hover:opacity-100">
             <X size={20} />
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-64 md:h-96 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="flex flex-col items-center space-y-4 p-6 text-center">
        <div className="p-4 bg-white rounded-full shadow-sm">
          <Upload className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-slate-700">Click to upload or drag & drop</h3>
          <p className="text-sm text-slate-500 mt-1">Supports JPG, PNG, WEBP</p>
        </div>
        <Button 
            variant="secondary" 
            onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
            }}
        >
            Select Image
        </Button>
      </div>
    </div>
  );
};