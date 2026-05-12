'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import EmailDialog from './EmailDialog';
import EmailIcon from '@/components/icons/EmailIcon';

interface EmailShareButtonProps {
  guestName: string;
  guestId: string;
  cardElementId: string;
}

export default function EmailShareButton({
  guestName,
  guestId,
  cardElementId,
}: EmailShareButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  return (
    <>
      <button
        className="email-button inline-flex items-center gap-3 px-10 py-4 text-base font-medium rounded-sm transition-all duration-300 font-serif"
        onClick={handleOpenDialog}
      >
        <EmailIcon className="w-5 h-5" />
        <span>Email 分享</span>
      </button>

      {mounted && showDialog && createPortal(
        <EmailDialog
          guestName={guestName}
          guestId={guestId}
          cardElementId={cardElementId}
          onClose={handleCloseDialog}
        />,
        document.body
      )}
    </>
  );
}
