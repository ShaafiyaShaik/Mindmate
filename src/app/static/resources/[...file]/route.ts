import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { file: string[] } }) {
  const fileParts = params.file || [];
  const filename = fileParts.join('/');

  const publicPath = path.join(process.cwd(), 'public', 'static', 'resources', ...fileParts);

  try {
    if (fs.existsSync(publicPath)) {
      const buffer = await fs.promises.readFile(publicPath);
      // Naively set content-type by extension
      const ext = path.extname(filename).toLowerCase();
      const contentType = ext === '.pdf' ? 'application/pdf' : ext === '.mp3' ? 'audio/mpeg' : 'application/octet-stream';
      return new NextResponse(Buffer.from(buffer), {
        headers: { 'Content-Type': contentType }
      });
    }
  } catch (e) {
    console.error('Error reading static resource:', e);
  }

  // If file not found, try to find matching resource in DB and redirect to its detail page
  try {
    const db = getDb();
    const urlPath = `/static/resources/${filename}`;
    const row: any = db.prepare('SELECT id FROM resources WHERE url = ? LIMIT 1').get(urlPath);
    if (row && row.id) {
      return NextResponse.redirect(new URL(`/resources/${row.id}`, request.url));
    }
  } catch (e) {
    console.error('DB lookup failed for static resource redirect:', e);
  }

  // Fallback: redirect to resources listing with filename query so UI can show search suggestions
  const searchUrl = new URL('/resources', request.url);
  searchUrl.searchParams.set('q', filename);
  return NextResponse.redirect(searchUrl);
}
