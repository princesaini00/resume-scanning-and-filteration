import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

let client: MongoClient;
let db: any;

async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
  }
  db = client.db('test');
  return db;
}

function convertObjectIds(obj: any): any {
  const newObj = { ...obj };
  for (const key in newObj) {
    const val = newObj[key];
    if (key === '_id' || key === 'jobId') {
      try {
        if (typeof val === 'string' && val.match(/^[0-9a-fA-F]{24}$/)) {
          newObj[key] = new ObjectId(val);
        }
      } catch {}
    }
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      newObj[key] = convertObjectIds(val);
    }
  }
  return newObj;
}

function cleanResults(docs: any[]): any[] {
  return Array.isArray(docs)
    ? docs.map((doc) => {
        if (doc && typeof doc === 'object' && '_id' in doc) {
          const { _id, ...rest } = doc;
          return {
            id: typeof _id?.toString === 'function' ? _id.toString() : null,
            ...rest,
          };
        }
        return {};
      })
    : [];
}

function formatSalaryResults(docs: any[]): any[] {
  if (!Array.isArray(docs)) return [];
  return docs.map(doc => {
    // Display salary in a cleaner format if it exists
    if (doc && doc.salary) {
      doc.displaySalary = doc.salary;
    }
    return doc;
  });
}

function enhanceResults(docs: any[], query: any): any[] {
  if (!Array.isArray(docs)) return [];
  
  // Logic for enhancing result display based on query type
  if (query.type === 'jobs') {
    return formatSalaryResults(docs);
  }
  
  // For resume-focused queries, ensure resumeUrl is in a convenient format
  if (query.projection && query.projection.resumeUrl) {
    return docs.map(doc => {
      if (doc.resumeUrl) {
        doc.displayResumeLink = doc.resumeUrl;
      }
      return doc;
    });
  }
  
  return docs;
}

async function handleLookupQuery(
  baseCollection: 'jobs' | 'applications',
  filters: any,
  fullQuery: any
) {
  const db = await connectDB();
  const baseCol = db.collection(baseCollection);
  const baseDocs = await baseCol.find(filters).toArray();

  if (!Array.isArray(baseDocs) || baseDocs.length === 0) {
    return NextResponse.json({
      success: false,
      message: 'No matching documents found.',
      data: [],
      totalCount: 0,
    });
  }

  const relatedCol = baseCollection === 'jobs' ? 'applications' : 'jobs';
  const relatedField = baseCollection === 'jobs' ? 'jobId' : '_id';
  const projectionField = baseCollection === 'jobs' ? 'jobId' : 'jobId';

  const relatedIds = baseDocs
    .map((doc) => (doc && typeof doc === 'object' && '_id' in doc ? doc._id : null))
    .filter((id) => id !== null);

  const relatedFilters: any = {
    [relatedField]: { $in: relatedIds },
  };
  
  // Add additional filters for the related collection
  if (fullQuery.additional_filters && Object.keys(fullQuery.additional_filters).length > 0) {
    Object.assign(relatedFilters, convertObjectIds(fullQuery.additional_filters));
  }

  // Prepare projection for the related collection
  const projection = fullQuery.projection || { name: 1, email: 1 };
  
  // Add jobId to projection to maintain relationship context
  if (baseCollection === 'jobs') {
    projection[projectionField] = 1;
  }

  // For application lookup, always include resume links if requested
  if (relatedCol === 'applications' && 
      (fullQuery.query_text?.toLowerCase().includes('resume') || 
       fullQuery.query_text?.toLowerCase().includes('cv'))) {
    projection.resumeUrl = 1;
  }

  const relatedData = await db
    .collection(relatedCol)
    .find(relatedFilters)
    .project(projection)
    .sort({ createdAt: -1 })
    .limit(fullQuery.limit || 10)
    .skip(fullQuery.skip || 0)
    .toArray();

  // Join in the job titles for better context in application results
  if (relatedCol === 'applications' && relatedData.length > 0) {
    const jobIds = relatedData
      .map((app: any) => app.jobId)
      .filter((id: any) => id !== undefined && id !== null);
    
    if (jobIds.length > 0) {
      const jobData = await db
        .collection('jobs')
        .find({ _id: { $in: jobIds } })
        .project({ title: 1 })
        .toArray();
      
      const jobMap = Object.fromEntries(
        jobData.map((job: any) => [job._id.toString(), job.title])
      );
      
      relatedData.forEach((app: any) => {
        if (app.jobId) {
          const jobIdStr = app.jobId.toString();
          app.jobTitle = jobMap[jobIdStr] || 'Unknown Job';
        }
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: `Found ${relatedData.length} related records`,
    type: relatedCol,
    data: enhanceResults(cleanResults(relatedData), fullQuery),
    totalCount: await db.collection(relatedCol).countDocuments(relatedFilters),
    context: {
      sourceCollection: baseCollection,
      sourceIds: relatedIds.map((id) =>
        typeof id?.toString === 'function' ? id.toString() : null
      ),
    },
  });
}

export async function POST(req: Request) {
  try {
    const query = await req.json();
    const {
      collection,
      type,
      filters = {},
      projection,
      sort = { createdAt: -1 },
      limit = 10,
      skip = 0,
      query_text = '',
      additional_filters,
    } = query;

    const db = await connectDB();
    const col = db.collection(collection);
    const mongoFilters = convertObjectIds(filters);

    if (type === 'count') {
      const count = await col.countDocuments(mongoFilters);
      // Replace the ${count} placeholder with the actual count
      let responseMessage = query.response || `Found ${count} results`;
      if (responseMessage.includes("${count}")) {
        responseMessage = responseMessage.replace(/\$\{count\}/g, count.toString());
      }
      
      return NextResponse.json({
        success: true,
        type: 'count',
        data: count,
        totalCount: count,
        message: responseMessage
      });
    }

    if (type === 'lookup') {
      return handleLookupQuery(collection, mongoFilters, {
        ...query,
        query_text: query_text,
      });
    }

    // Ensure projection includes the right fields based on the collection
    let effectiveProjection = projection || {};
    
    // Always include name/email for applications
    if (collection === 'applications' && !projection) {
      effectiveProjection = { name: 1, email: 1, createdAt: 1 };
    }
    
    // Always include title/location for jobs
    if (collection === 'jobs' && !projection) {
      effectiveProjection = { title: 1, location: 1, salary: 1, company: 1 };
    }
    
    // If resume is mentioned, ensure resumeUrl is included
    if (query_text?.toLowerCase().includes('resume') || 
        query_text?.toLowerCase().includes('cv')) {
      effectiveProjection.resumeUrl = 1;
    }
    
    // For education or experience queries, include those fields
    if (query_text?.toLowerCase().includes('education') || 
        query_text?.toLowerCase().includes('graduate') ||
        query_text?.toLowerCase().includes('university')) {
      if (collection === 'applications') {
        effectiveProjection['parsedData.education'] = 1;
      }
    }
    
    if (query_text?.toLowerCase().includes('experience') || 
        query_text?.toLowerCase().includes('worked') ||
        query_text?.toLowerCase().includes('company')) {
      if (collection === 'applications') {
        effectiveProjection['parsedData.experience'] = 1;
      }
    }

    const results = await col
      .find(mongoFilters)
      .project(effectiveProjection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalCount = await col.countDocuments(mongoFilters);

    return NextResponse.json({
      success: true,
      type: collection,
      data: enhanceResults(cleanResults(results), query),
      totalCount,
    });
  } catch (err) {
    console.error('Query execution failed:', err);
    return NextResponse.json({
      success: false,
      message: 'Hey, please specify clearly how can i help you.',
      data: null,
    });
  }
}