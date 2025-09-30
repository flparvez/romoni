import { getCities } from '@/lib/pathao';
import { NextResponse } from 'next/server';


export async function GET() {
  try {
    const cities = await getCities();
    return NextResponse.json(cities, { status: 200 });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json({
      message: 'Failed to fetch city list',
      error: (error as any).response?.data || (error as Error).message,
    }, { status: 500 });
  }
}