import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Copy, Facebook, Twitter, MessageCircle, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordId: string;
  recordTitle: string;
}

export const ShareDialog = ({ open, onOpenChange, recordId, recordTitle }: ShareDialogProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const recordUrl = `${window.location.origin}/record/${recordId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(recordUrl);
      toast({
        title: 'Link copied!',
        description: 'Record link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  const shareToSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(recordUrl);
    const encodedTitle = encodeURIComponent(recordTitle);
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    };

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  const generateQR = async () => {
    try {
      const url = await QRCode.toDataURL(recordUrl, {
        width: 300,
        margin: 2,
      });
      setQrCodeUrl(url);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Record</DialogTitle>
          <DialogDescription>
            Share this record with others
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Copy Link */}
          <div className="flex items-center gap-2">
            <Input value={recordUrl} readOnly className="flex-1" />
            <Button size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Social Media */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => shareToSocial('facebook')}
              className="gap-2"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
            <Button
              variant="outline"
              onClick={() => shareToSocial('twitter')}
              className="gap-2"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              onClick={() => shareToSocial('whatsapp')}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </div>

          {/* QR Code */}
          <div className="text-center">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
            ) : (
              <Button
                variant="outline"
                onClick={generateQR}
                className="gap-2"
              >
                <QrCode className="h-4 w-4" />
                Generate QR Code
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
