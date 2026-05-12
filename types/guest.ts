export interface Guest {
  id: string;
  name: string;
  phone?: string;
  customization: {
    message: string;
    images: string[];
    templateId?: string;
    metadata?: {
      relationship?: string;
      specialNote?: string;
    };
  };
  viewedAt?: Date;
  downloadedAt?: Date;
  emailSentAt?: Date;
}

export interface GuestData {
  guest: Guest;
}
