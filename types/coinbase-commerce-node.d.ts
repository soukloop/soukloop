declare module 'coinbase-commerce-node' {
  export interface Charge {
    id: string;
    name?: string;
    description?: string;
    hosted_url?: string;
    status?: string;
    pricing?: {
      local: {
        amount: string;
        currency: string;
      };
    };
    timeline?: Array<{
      status: string;
      time: string;
    }>;
    code?: string;
    expires_at?: string;
    metadata?: Record<string, any>;
    redirect_url?: string;
    cancel_url?: string;
    created_at: string;
    updated_at: string;
  }

  export interface CreateChargeRequest {
    name: string;
    description: string;
    local_price: {
      amount: string;
      currency: string;
    };
    pricing_type: 'fixed_price';
    metadata?: Record<string, any>;
    redirect_url?: string;
    cancel_url?: string;
  }

  export class Client {
    constructor(options: {
      apiKey: string;
      version?: string;
    });

    charges: {
      create(chargeData: CreateChargeRequest): Promise<{ data: Charge }>;
      retrieve(chargeId: string): Promise<{ data: Charge }>;
    };
  }

  export class Webhook {
    constructor(webhookSecret: string);
    verify(body: string, signature: string, timestamp: string): any;
  }

  export const resources: {
    Charge: typeof Client;
    Webhook: typeof Webhook;
  };
}
