import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Share } from 'lucide-react';

interface PhotoModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ src, alt, isOpen, onClose }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: alt || 'Shared Image',
          url: src
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/90">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Action buttons */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-white hover:bg-white/10"
            >
              <Download className="w-5 h-5" />
            </Button>
            {navigator.share && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-white hover:bg-white/10"
              >
                <Share className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Image */}
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain"
            onClick={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};