import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('activeOnly');
  const vendor = searchParams.get('vendor');

  // Sirf specific params allow, warna error (CORS avoid karne ke liye proxy, lekin validate)
  if (activeOnly !== 'true' || vendor !== 'Annapurna Khakhra') {
    return NextResponse.json({
      success: false,
      message: 'Invalid parameters. Required: activeOnly=true & vendor=Annapurna Khakhra',
    }, { status: 400 });
  }

  try {
    // Fetch from your internal API (change URL if needed)
    const response = await fetch('https://adminrocket.megascale.co.in/api/suggested/list?activeOnly=true&vendor=Annapurna Khakhra');
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();

    // Return the data as is
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error fetching data: ' + error.message,
    }, { status: 500 });
  }
}