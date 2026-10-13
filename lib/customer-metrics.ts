import { normalizePhone } from "./club";
export type SalesRequest = {
  id: string;
  phone: string;
  name: string;
  created_at: string;
  status?: string;
  service_id?: string;
  user_id?: string | null;
  completed_at?: string | null;
  direct_cost?: number | null;
  analytics_session_id?: string | null;
  commerce?: {
    additional_service_ids?: string[];
    upgrade_ids?: string[];
    tier?: string;
    referral_code?: string;
  };
};
export type SalesPayment = {
  quote_id: string;
  amount: number;
  refunded_amount: number;
  created_at: string;
};
export type SalesQuote = { id: string; request_id: string; items?: { kind: string; amount: number }[] };
export function customerMetrics(
  requests: SalesRequest[],
  quotes: SalesQuote[],
  payments: SalesPayment[],
  now = new Date(),
) {
  const allOrders = payments.flatMap((payment) => {
    const quote = quotes.find((quote) => quote.id === payment.quote_id);
    const request = requests.find(
      (request) => request.id === quote?.request_id,
    );
    const net = Number(payment.amount) - Number(payment.refunded_amount);
    return request && net >= 0
      ? [{ request, net, at: new Date(payment.created_at) }]
      : [];
  });
  const paid = allOrders.filter((order) => order.net > 0);
  const contacts = new Map<string, typeof paid>();
  for (const order of paid) {
    const key = normalizePhone(order.request.phone);
    contacts.set(key, [...(contacts.get(key) || []), order]);
  }
  let costedRevenue = 0,
    cost = 0,
    costCoverage = 0;
  for (const order of allOrders) {
    if (order.request.direct_cost != null) {
      costedRevenue += order.net;
      cost += Number(order.request.direct_cost);
      costCoverage++;
    }
  }
  const cohort = [30, 60, 90, 180].map((days) => {
    let eligible = 0,
      repeated = 0;
    for (const orders of contacts.values()) {
      const sorted = [...orders].sort(
        (a, b) => a.at.getTime() - b.at.getTime(),
      );
      const first = sorted[0].at.getTime();
      if (now.getTime() - first >= days * 86400000) {
        eligible++;
        if (
          sorted
            .slice(1)
            .some((order) => order.at.getTime() - first <= days * 86400000)
        )
          repeated++;
      }
    }
    return {
      days,
      eligible,
      repeated,
      rate: eligible ? repeated / eligible : null,
    };
  });
  const fulfilled = paid.filter((order) => order.request.status === "completed");
  const addonOrders = paid.filter((order) => quotes.find((quote) => quote.request_id === order.request.id)?.items?.some((item) => ["addon", "upgrade"].includes(item.kind)));
  const revenue = paid.reduce((sum, order) => sum + order.net, 0);
  return {
    revenue,
    orders: paid.length,
    contacts: contacts.size,
    averageOrder: paid.length ? revenue / paid.length : null,
    realizedValue: contacts.size ? revenue / contacts.size : null,
    costedRevenue,
    cost,
    contribution: costedRevenue - cost,
    costCoverage,
    costableOrders: allOrders.length,
    cohort,
    paid,
    fulfilled,
    addonOrders,
  };
}
