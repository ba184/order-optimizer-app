-- Change bill_photo from text to text array for multiple images
ALTER TABLE public.expense_claims 
ALTER COLUMN bill_photo TYPE text[] USING 
  CASE 
    WHEN bill_photo IS NULL THEN NULL
    WHEN bill_photo = '' THEN NULL
    ELSE ARRAY[bill_photo]
  END;