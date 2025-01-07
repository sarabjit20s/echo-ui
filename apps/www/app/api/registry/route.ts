import { registry } from '@echo-ui/registry';

export async function GET() {
  try {
    return Response.json(registry);
  } catch (error) {
    console.error('Error fetching registry:', error);
    return Response.json({ error: 'Error fetching registry' }, { status: 500 });
  }
}
