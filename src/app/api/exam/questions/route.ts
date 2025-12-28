import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const yamlPath = path.join(process.cwd(), 'public/data/questions.yaml');
    const yamlContent = await fs.readFile(yamlPath, 'utf8');

    return new NextResponse(yamlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/yaml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Failed to load YAML file:', error);
    return NextResponse.json(
      { error: 'Failed to load exam questions' },
      { status: 500 }
    );
  }
}
