import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';

const app = new Hono();
app.get(serveStatic({ root: './public' }));

Deno.serve(app.fetch);
