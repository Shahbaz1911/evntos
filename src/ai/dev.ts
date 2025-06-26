import { config } from 'dotenv';
config();
import '@opentelemetry/exporter-jaeger';

import '@/ai/flows/generate-seo-friendly-url.ts';
import '@/ai/flows/send-ticket-email-flow.ts';
import '@/ai/flows/send-welcome-email-flow.ts';
