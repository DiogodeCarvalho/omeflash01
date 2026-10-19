import Stripe from 'stripe';
import { db, User } from './db.js';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Initialize Stripe instance if key exists
export const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia' as any,
    })
  : null;

export const isStripeConfigured = Boolean(STRIPE_SECRET_KEY);

export interface CheckoutOptions {
  planId: string;
  user: User;
  baseUrl: string;
}

export async function createCheckoutSession({ planId, user, baseUrl }: CheckoutOptions) {
  const plan = db.getPlanById(planId);
  if (!plan) {
    throw new Error('Plano de assinatura não encontrado.');
  }

  // If live/test Stripe secret key is configured, create real Stripe Checkout Session
  if (stripe && STRIPE_SECRET_KEY) {
    // Check or create customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
      db.updateUser(user.id, { stripeCustomerId: customerId });
    }

    const sessionParams: any = {
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `OmeFlash - ${plan.name}`,
              description: `Acesso irrestrito ao catálogo de vídeos OmeFlash (${plan.periodLabel})`,
              images: ['https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80'],
            },
            unit_amount: Math.round(plan.price * 100),
            recurring: {
              interval: plan.interval === 'quarter' ? 'month' : plan.interval,
              interval_count: plan.interval === 'quarter' ? 3 : 1,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: plan.id,
        },
      },
      success_url: `${baseUrl}?session_id={CHECKOUT_SESSION_ID}&checkout_success=true&plan=${plan.id}`,
      cancel_url: `${baseUrl}?checkout_canceled=true`,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    db.addWebhookLog({
      event: 'checkout.session.created',
      status: 'success',
      message: `Sessão de checkout Stripe criada para ${user.email} (Plano: ${plan.name})`,
      payloadSummary: JSON.stringify({ sessionId: session.id, customerId }),
    });

    return { url: session.url, sessionId: session.id, mode: 'stripe' };
  }

  // Fallback mode: Built-in sandbox/simulator for testing before Stripe API keys are configured
  // This allows full testing in development and sandbox preview
  const simulatedSessionId = `cs_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  db.addWebhookLog({
    event: 'checkout.session.simulated',
    status: 'success',
    message: `Sessão simulada iniciada para ${user.email} (${plan.name}). Chaves Stripe não detectadas no ambiente.`,
    payloadSummary: JSON.stringify({ planId, userId: user.id, simulatedSessionId }),
  });

  return {
    url: `${baseUrl}?simulator=true&sessionId=${simulatedSessionId}&planId=${plan.id}&userId=${user.id}`,
    sessionId: simulatedSessionId,
    mode: 'simulation',
  };
}

export async function createBillingPortalSession(user: User, baseUrl: string) {
  if (stripe && user.stripeCustomerId) {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}`,
    });
    return portalSession.url;
  }
  return null;
}

export async function handleWebhookEvent(payload: Buffer | string, signature?: string) {
  let event: Stripe.Event;

  if (stripe && STRIPE_WEBHOOK_SECRET && signature && Buffer.isBuffer(payload)) {
    try {
      event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      db.addWebhookLog({
        event: 'webhook.signature_failed',
        status: 'failed',
        message: `Falha na validação da assinatura Stripe Webhook: ${err.message}`,
      });
      throw new Error(`Webhook Error: ${err.message}`);
    }
  } else {
    // If not cryptographically verified because webhook secret is not configured in dev, parse safely
    try {
      const json = Buffer.isBuffer(payload) ? payload.toString('utf-8') : payload;
      event = typeof json === 'string' ? JSON.parse(json) : json;
    } catch (e: any) {
      throw new Error('Invalid JSON payload');
    }
  }

  return await processStripeEvent(event);
}

export async function processStripeEvent(event: any) {
  const eventType = event.type;
  const dataObject = event.data?.object;

  switch (eventType) {
    case 'checkout.session.completed': {
      const session = dataObject;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId as any;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      let user: User | undefined;
      if (userId) {
        user = db.getUserById(userId);
      }
      if (!user && customerId) {
        user = db.getUserByStripeCustomerId(customerId);
      }
      if (!user && session.customer_details?.email) {
        user = db.getUserByEmail(session.customer_details.email);
      }

      if (user) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // default 1 month

        db.updateUser(user.id, {
          subscriptionStatus: 'active',
          subscriptionPlan: planId || 'vip_monthly',
          subscriptionExpiresAt: expiresAt.toISOString(),
          stripeCustomerId: customerId || user.stripeCustomerId,
          stripeSubscriptionId: subscriptionId || user.stripeSubscriptionId,
        });

        db.addWebhookLog({
          event: eventType,
          status: 'success',
          message: `Assinatura ATIVADA para ${user.email} através do Checkout Stripe!`,
          payloadSummary: JSON.stringify({ userId: user.id, planId, subscriptionId }),
        });
      }
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = dataObject;
      const customerId = sub.customer as string;
      const status = sub.status; // 'active', 'past_due', 'canceled', etc.
      const userId = sub.metadata?.userId;

      let user = userId ? db.getUserById(userId) : db.getUserByStripeCustomerId(customerId);

      if (user) {
        let subscriptionStatus: User['subscriptionStatus'] = 'none';
        if (status === 'active' || status === 'trialing') {
          subscriptionStatus = 'active';
        } else if (status === 'past_due' || status === 'unpaid') {
          subscriptionStatus = 'past_due';
        } else if (status === 'canceled') {
          subscriptionStatus = 'canceled';
        }

        const currentPeriodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;

        db.updateUser(user.id, {
          subscriptionStatus,
          subscriptionExpiresAt: currentPeriodEnd || user.subscriptionExpiresAt,
          stripeSubscriptionId: sub.id,
          stripeCustomerId: customerId,
        });

        db.addWebhookLog({
          event: eventType,
          status: 'success',
          message: `Status de assinatura atualizado para ${user.email}: ${subscriptionStatus}`,
          payloadSummary: JSON.stringify({ status: subscriptionStatus, subId: sub.id }),
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = dataObject;
      const customerId = sub.customer as string;
      const user = db.getUserByStripeCustomerId(customerId) || db.getUserByStripeSubscriptionId(sub.id);

      if (user) {
        db.updateUser(user.id, {
          subscriptionStatus: 'canceled',
        });

        db.addWebhookLog({
          event: eventType,
          status: 'success',
          message: `Assinatura CANCELADA para ${user.email}. Acesso VIP revogado.`,
          payloadSummary: JSON.stringify({ userId: user.id, subId: sub.id }),
        });
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = dataObject;
      const customerId = invoice.customer as string;
      const user = db.getUserByStripeCustomerId(customerId);

      if (user) {
        const nextPayment = new Date();
        nextPayment.setMonth(nextPayment.getMonth() + 1);

        db.updateUser(user.id, {
          subscriptionStatus: 'active',
          subscriptionExpiresAt: nextPayment.toISOString(),
        });

        db.addWebhookLog({
          event: eventType,
          status: 'success',
          message: `Fatura paga com sucesso para ${user.email}. Renovação confirmada!`,
          payloadSummary: JSON.stringify({ amountPaid: invoice.amount_paid }),
        });
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = dataObject;
      const customerId = invoice.customer as string;
      const user = db.getUserByStripeCustomerId(customerId);

      if (user) {
        db.updateUser(user.id, {
          subscriptionStatus: 'past_due',
        });

        db.addWebhookLog({
          event: eventType,
          status: 'failed',
          message: `Falha na cobrança da fatura para ${user.email}. Assinatura suspensa.`,
          payloadSummary: JSON.stringify({ error: invoice.last_finalization_error?.message }),
        });
      }
      break;
    }

    default: {
      db.addWebhookLog({
        event: eventType,
        status: 'ignored',
        message: `Evento recebido e arquivado: ${eventType}`,
      });
      break;
    }
  }

  return { received: true };
}
