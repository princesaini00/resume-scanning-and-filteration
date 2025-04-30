// app/api/filter-options/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db('test');
    const jobsCollection = db.collection('jobs');

    const positions = await jobsCollection.distinct('title');
    const locations = await jobsCollection.distinct('location');

    return NextResponse.json({ positions, locations });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await client.close();
  }
}
