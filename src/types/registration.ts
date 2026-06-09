/** Shape of a row in the `registrations` table. */
export interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  aadhaar_number: string;
  aadhaar_document_url: string;
  aadhaar_public_id: string | null;
  aadhaar_resource_type: string | null;
  created_at: string;
}

/** Payload accepted by POST /api/register. */
export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  aadhaarNumber: string;
  aadhaarDocumentUrl: string;
  aadhaarPublicId?: string;
  aadhaarResourceType?: string;
}
