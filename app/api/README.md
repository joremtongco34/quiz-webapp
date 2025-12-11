# API Integration

This directory can be used for Next.js API routes if needed, or you can integrate directly with your backend API.

To connect to your backend API, use the `NEXT_PUBLIC_API_URL` environment variable.

Example API client usage:
\`\`\`typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchUsers() {
  const response = await fetch(\`\${apiUrl}/api/users\`);
  return response.json();
}
\`\`\`
