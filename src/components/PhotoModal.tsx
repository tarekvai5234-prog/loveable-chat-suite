import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Upload, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  onUpload?: () => void;
  onDelete?: () => void;
  previousPhotos?: string[];
  canEdit?: boolean;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ 
  src, 
  alt, 
  isOpen, 
  onClose, 
  onUpload,
  onDelete,
  previousPhotos = [],
  canEdit = false
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const allPhotos = [src, ...previousPhotos];
  const currentPhoto = allPhotos[currentPhotoIndex];

  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
  };

  const handleNext = () => {
    setCurrentPhotoIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/90 border-0">
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Action buttons - only show if user can edit */}
          {canEdit && (
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              {onUpload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onUpload();
                    onClose();
                  }}
                  className="text-white hover:bg-white/20 gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload New
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                  className="text-white hover:bg-white/20 gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}
            </div>
          )}

          {/* Image */}
          <div className="relative flex items-center justify-center w-full h-full">
            {allPhotos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="absolute left-0 z-10 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="absolute right-0 z-10 text-white hover:bg-white/20"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}
            
            <img
              src={currentPhoto}
              alt={alt}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>

          {/* Photo counter */}
          {allPhotos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
              {currentPhotoIndex + 1} / {allPhotos.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};