import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.unitId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, unitId' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Save this lead to your database (e.g., Prisma, PostgreSQL)
    // 2. Send a webhook to your CRM (e.g., Salesforce, HubSpot)
    // 3. Send a confirmation email to the user
    
    console.log('--- NEW LEAD CAPTURED ---');
    console.log(JSON.stringify(body, null, 2));
    console.log('-------------------------');

    // Simulate network delay for CRM sync
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json(
      { 
        success: true, 
        message: 'Lead captured successfully',
        leadId: `LD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error capturing lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
