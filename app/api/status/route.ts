import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redisClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }

  try {
    const jobData = await redis.get(`job:${jobId}`);
    
    if (!jobData) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // In a real implementation, we'd check if the job is completed and return the image URL
    // For now, we'll just return the job data
    // The worker would update the job status in Redis
    
    return NextResponse.json(JSON.parse(jobData as string));

  } catch (error: any) {
    console.error('Error fetching job status:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch job status' }, { status: 500 });
  }
}
