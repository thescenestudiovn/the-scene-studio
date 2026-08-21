-- Remove test media records whose source files do not exist on the NAS.
DELETE FROM media
WHERE id IN ('media-test-04', 'media-test-05', '071f351a-9e8b-4996-a3ce-d94a6ec9d752')
  AND path IN ('/images/test-04.jpg', '/images/test-05.jpg', '/images/test-06.jpg');
