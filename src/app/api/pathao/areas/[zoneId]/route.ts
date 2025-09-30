import { getAreas } from '@/lib/pathao';
import { NextResponse } from 'next/server';


export async function GET(request: Request,   { params }: { params: Promise<{ zoneId: string }> }) {
  const { zoneId } =await params;
  try {
    const areas = await getAreas(parseInt(zoneId, 10));
    return NextResponse.json(areas, { status: 200 });
  } catch (error) {
    console.error('Error fetching areas:', error);
    return NextResponse.json({
      message: 'Failed to fetch area list',
      error: (error as any).response?.data || (error as Error).message,
    }, { status: 500 });
  }
}