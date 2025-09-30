import { getZones } from '@/lib/pathao';
import { NextResponse } from 'next/server';


export async function GET(request: Request,   { params }: { params: Promise<{ cityId: string }> }) {
  const { cityId } =await params;
  try {
    const zones = await getZones(parseInt(cityId, 10));
    return NextResponse.json(zones, { status: 200 });
  } catch (error) {
    console.error('Error fetching zones:', error);
    // Correctly handle the error by sending a serializable message
    const errorMessage = (error as Error).message;
    return NextResponse.json({
      message: 'Failed to fetch zone list',
      error: errorMessage,
    }, { status: 500 });
  }
}