# OmeFlash

Plataforma de vídeos por assinatura (React + Express + Stripe).

## Rodar localmente

1. `npm install`
2. Copie `.env.example` para `.env` e ajuste os valores (em desenvolvimento nada é obrigatório).
3. `npm run dev` e abra http://localhost:3000

Em desenvolvimento são criadas contas de demonstração (admin, VIP e comum) e o checkout usa um simulador
quando não há chaves da Stripe.

## Produção

- `npm run build` e depois `NODE_ENV=production npm start`
- Obrigatório: `JWT_SECRET`, `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET`.
- Defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` para criar o primeiro administrador.
- Em produção o simulador de pagamento e as contas de demonstração ficam desativados.
- Configure o webhook da Stripe para `POST /api/stripe/webhook` com os eventos:
  `checkout.session.completed`, `customer.subscription.created|updated|deleted`,
  `invoice.payment_succeeded` e `invoice.payment_failed`.
