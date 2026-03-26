CREATE POLICY "Allow PDF read"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'intellipdf-files'
);