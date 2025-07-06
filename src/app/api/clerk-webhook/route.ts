import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { prisma } from '@/prisma';

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.SIGNING_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add SIGNING_SECRET from Clerk Dashboard to .env');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  type ClerkWebhookEvent = {
    data: {
      id: string;
      email_addresses: { email_address: string }[];
      username?: string;
      first_name?: string;
      last_name?: string;
      image_url?: string;
    };
    type: string;
  };

  let evt: ClerkWebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    try {
      await prisma.user.create({
        data: {
          id: id,
          clerkId: id,
          email: evt.data.email_addresses[0].email_address,
          username: evt.data.username || `user_${id.slice(0, 8)}`,
          displayName: evt.data.first_name && evt.data.last_name 
            ? `${evt.data.first_name} ${evt.data.last_name}`
            : evt.data.first_name || evt.data.username || `User ${id.slice(0, 8)}`,
          img: evt.data.image_url,
        },
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    try {
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: evt.data.email_addresses[0].email_address,
          username: evt.data.username || `user_${id.slice(0, 8)}`,
          displayName: evt.data.first_name && evt.data.last_name 
            ? `${evt.data.first_name} ${evt.data.last_name}`
            : evt.data.first_name || evt.data.username || `User ${id.slice(0, 8)}`,
          img: evt.data.image_url,
        },
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return new Response('Error updating user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      await prisma.user.delete({
        where: { clerkId: id },
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return new Response('Error deleting user', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}
