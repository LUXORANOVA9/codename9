import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redisClient';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, width, height, steps, cfgScale } = body;

    // 1. Check Cache (Semantic or Exact)
    // For simplicity, we'll use a simple hash of the prompt for now.
    // In a real implementation, we'd use pgvector for semantic search.
    const promptHash = Buffer.from(prompt).toString('base64');
    const cachedImage = await redis.get(`image:${promptHash}`);

    if (cachedImage) {
      return NextResponse.json({ status: 'completed', imageUrl: cachedImage, cached: true });
    }

    // 2. Create Job
    const jobId = uuidv4();
    const jobData = {
      id: jobId,
      prompt,
      width: width || 512,
      height: height || 512,
      steps: steps || 20,
      cfgScale: cfgScale || 7,
      status: 'pending',
      createdAt: Date.now(),
    };

    // 3. Push to Queue
    await redis.lpush('job_queue', JSON.stringify(jobData));
    
    // 4. Store Job Status
    await redis.set(`job:${jobId}`, JSON.stringify(jobData));
    // Set TTL for job status (e.g., 1 hour)
    await redis.expire(`job:${jobId}`, 3600);

    return NextResponse.json({ status: 'queued', jobId });

  } catch (error: any) {
    console.error('Error queuing job:', error);
    return NextResponse.json({ error: error.message || 'Failed to queue job' }, { status: 500 });
  }
}
