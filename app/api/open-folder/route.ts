import { exec } from 'child_process';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { folderPath } = await request.json();
    if (!folderPath) {
      return NextResponse.json({ error: 'No folderPath provided' }, { status: 400 });
    }
    // Launch Finder on MacOS using the "open" command
    exec(`open "${folderPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error opening folder: ${stderr}`);
      }
    });
    return NextResponse.json({ message: 'Folder opened successfully' });
  } catch (error: any) {
    console.error('Error in open-folder API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}