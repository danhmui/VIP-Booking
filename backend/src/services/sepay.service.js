import { confirmBankTransferTransaction } from './payment.service.js';

const defaultPollIntervalMs = 10000;
const defaultTransactionLimit = 20;

let isPolling = false;
let pollTimer = null;
let lastTransactionId = null;

const getSepayConfig = () => ({
  token: process.env.SEPAY_API_TOKEN,
  accountNumber: process.env.SEPAY_ACCOUNT_NUMBER || process.env.VIETQR_ACCOUNT,
  pollEnabled: process.env.SEPAY_POLL_ENABLED === 'true',
  pollIntervalMs: Number(process.env.SEPAY_POLL_INTERVAL_MS) || defaultPollIntervalMs,
  transactionLimit: Number(process.env.SEPAY_TRANSACTION_LIMIT) || defaultTransactionLimit,
});

const toNumber = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : undefined;
};

const normalizeSepayTransaction = (transaction) => ({
  id: transaction.id?.toString(),
  amount: toNumber(transaction.amount_in),
  transferContent: transaction.transaction_content || transaction.content || transaction.description || '',
});

const buildTransactionsUrl = ({ accountNumber, transactionLimit }) => {
  const url = new URL('https://my.sepay.vn/userapi/transactions/list');
  url.searchParams.set('limit', String(transactionLimit));

  if (accountNumber) {
    url.searchParams.set('account_number', accountNumber);
  }

  if (lastTransactionId) {
    url.searchParams.set('since_id', lastTransactionId);
  }

  return url;
};

const fetchSepayTransactions = async (config) => {
  const response = await fetch(buildTransactionsUrl(config), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${config.token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`SePay API request failed with ${response.status}`);
  }

  const payload = await response.json();
  return Array.isArray(payload.transactions) ? payload.transactions : [];
};

export const syncSepayTransactions = async () => {
  const config = getSepayConfig();

  if (!config.token) {
    return { checked: 0, confirmed: 0, skipped: true };
  }

  const transactions = await fetchSepayTransactions(config);
  let confirmed = 0;
  const sortedTransactions = transactions
    .filter((transaction) => transaction.id)
    .sort((left, right) => Number(left.id) - Number(right.id));

  for (const transaction of sortedTransactions) {
    const normalizedTransaction = normalizeSepayTransaction(transaction);

    try {
      await confirmBankTransferTransaction(normalizedTransaction);
      confirmed += 1;
    } catch (error) {
      if (error.statusCode && error.statusCode >= 500) {
        throw error;
      }
    }

    lastTransactionId = normalizedTransaction.id;
  }

  return { checked: sortedTransactions.length, confirmed, skipped: false };
};

export const startSepayPolling = () => {
  const config = getSepayConfig();

  if (!config.pollEnabled || !config.token || pollTimer) {
    return;
  }

  void syncSepayTransactions().catch((error) => {
    console.error('Initial SePay transaction sync failed:', error.message);
  });

  pollTimer = setInterval(async () => {
    if (isPolling) {
      return;
    }

    isPolling = true;

    try {
      await syncSepayTransactions();
    } catch (error) {
      console.error('SePay transaction sync failed:', error.message);
    } finally {
      isPolling = false;
    }
  }, config.pollIntervalMs);
};
