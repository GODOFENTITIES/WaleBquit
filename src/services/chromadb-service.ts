'use server';

import { CloudClient } from 'chromadb';

// WARNING: Storing API keys directly in the code is not recommended for production environments.
// Consider using environment variables for better security.
export const client = new CloudClient({
  apiKey: 'AIzaSyA_S3tNqy8fK5Cj1ULmxQMxZc6oset1_zM',
  tenant: '1e5dd029-78fa-4155-a80c-a3a69fecadff',
  database: 'walebquit',
});
