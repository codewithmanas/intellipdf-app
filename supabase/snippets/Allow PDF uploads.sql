CREATE POLICY "Allow PDF uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
bucket_id = 'intellipdf-files'
AND storage.extension(name) = 'pdf'
);