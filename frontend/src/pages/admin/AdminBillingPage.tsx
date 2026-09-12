import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createInvoiceWithApi,
  createPaymentWithApi,
  deleteInvoiceWithApi,
  deletePaymentWithApi,
  fetchInvoices,
  fetchPayments,
  updateInvoiceWithApi,
  updatePaymentWithApi,
} from '../../api/vipBookingApi'
import { Icon } from '../../components/icons/Icon'
import { useToast } from '../../context/ToastContext'
import type { InvoiceRecord, PaymentRecord } from '../../types'

function normalizeQuery(value: string) {
  return value.trim().toLowerCase()
}

function parseAmount(value: string) {
  return Number(value.replace(/\D/g, '')) || 0
}

function toDateTimeLocal(value: string) {
  if (!value || value === '-') return ''
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 16)
}

export function AdminBillingPage() {
  const { confirmToast, showToast } = useToast()
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [paymentSearch, setPaymentSearch] = useState('')
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'All' | InvoiceRecord['status']>('All')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'All' | PaymentRecord['status']>('All')
  const [activeInvoice, setActiveInvoice] = useState<InvoiceRecord | null>(null)
  const [activePayment, setActivePayment] = useState<PaymentRecord | null>(null)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const reloadBilling = async () => {
    const [nextInvoices, nextPayments] = await Promise.all([fetchInvoices(), fetchPayments()])
    setInvoices(nextInvoices)
    setPayments(nextPayments)
  }

  useEffect(() => {
    reloadBilling().catch((error) => {
      const message = error instanceof Error ? error.message : 'Could not load billing data.'
      showToast({ title: 'Could not load billing data', message, variant: 'error' })
    })
  }, [showToast])

  const filteredInvoices = useMemo(() => {
    const query = normalizeQuery(invoiceSearch)

    return invoices.filter((invoice) => {
      const statusMatch = invoiceStatusFilter === 'All' || invoice.status === invoiceStatusFilter
      const textMatch =
        !query ||
        invoice.id.toLowerCase().includes(query) ||
        invoice.bookingId.toLowerCase().includes(query) ||
        invoice.code.toLowerCase().includes(query) ||
        invoice.guest.toLowerCase().includes(query)

      return statusMatch && textMatch
    })
  }, [invoiceSearch, invoiceStatusFilter, invoices])

  const filteredPayments = useMemo(() => {
    const query = normalizeQuery(paymentSearch)

    return payments.filter((payment) => {
      const statusMatch = paymentStatusFilter === 'All' || payment.status === paymentStatusFilter
      const textMatch =
        !query ||
        payment.id.toLowerCase().includes(query) ||
        payment.invoiceId.toLowerCase().includes(query) ||
        payment.invoiceCode.toLowerCase().includes(query) ||
        payment.staffName.toLowerCase().includes(query)

      return statusMatch && textMatch
    })
  }, [paymentSearch, paymentStatusFilter, payments])

  const paidRevenue = payments
    .filter((payment) => payment.status === 'success')
    .reduce((total, payment) => total + parseAmount(payment.amount), 0)
  const unpaidTotal = invoices
    .filter((invoice) => invoice.status === 'unpaid' || invoice.status === 'partial_paid')
    .reduce((total, invoice) => total + parseAmount(invoice.totalAmount), 0)

  const openInvoiceModal = (invoice?: InvoiceRecord) => {
    setActiveInvoice(invoice ?? null)
    setIsInvoiceModalOpen(true)
  }

  const openPaymentModal = (payment?: PaymentRecord) => {
    setActivePayment(payment ?? null)
    setIsPaymentModalOpen(true)
  }

  const closeInvoiceModal = () => {
    setActiveInvoice(null)
    setIsInvoiceModalOpen(false)
  }

  const closePaymentModal = () => {
    setActivePayment(null)
    setIsPaymentModalOpen(false)
  }

  const handleInvoiceSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const bookingId = String(formData.get('bookingId') ?? '').trim()
    const invoiceCode = String(formData.get('invoiceCode') ?? '').trim()
    const issuedDate = String(formData.get('issuedDate') ?? '').trim()
    const totalAmount = String(formData.get('totalAmount') ?? '').trim()
    const roomAmount = String(formData.get('roomAmount') ?? '').trim()
    const serviceAmount = String(formData.get('serviceAmount') ?? '').trim()
    const status = String(formData.get('status') ?? 'unpaid') as InvoiceRecord['status']
    const note = String(formData.get('note') ?? '').trim()

    if (!bookingId && !activeInvoice) {
      showToast({
        title: 'Booking ID is required',
        message: 'Booking ID is required to create an invoice.',
        variant: 'error',
      })
      return
    }

    try {
      let apiMessage = ''
      if (activeInvoice) {
        const invoice = await updateInvoiceWithApi(activeInvoice.id, {
          status,
          totalAmount,
          note,
        })
        apiMessage = invoice.apiMessage
      } else {
        const invoice = await createInvoiceWithApi({
          bookingId,
          invoiceCode,
          issuedDate,
          roomAmount,
          serviceAmount,
          status,
          note,
        })
        apiMessage = invoice.apiMessage
      }

      await reloadBilling()
      closeInvoiceModal()
      showToast({ title: 'Invoice saved', message: apiMessage, variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save invoice.'
      showToast({ title: 'Could not save invoice', message, variant: 'error' })
    }
  }

  const handlePaymentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const invoiceId = String(formData.get('invoiceId') ?? '').trim()
    const amount = String(formData.get('amount') ?? '').trim()
    const method = String(formData.get('method') ?? 'cash') as PaymentRecord['method']
    const status = String(formData.get('status') ?? 'pending') as PaymentRecord['status']
    const paidAt = String(formData.get('paidAt') ?? '').trim()
    const staffId = String(formData.get('staffId') ?? '').trim()

    if (!invoiceId && !activePayment) {
      showToast({
        title: 'Invoice ID is required',
        message: 'Invoice ID is required to create a payment.',
        variant: 'error',
      })
      return
    }

    if (!amount) {
      showToast({
        title: 'Payment amount is required',
        message: 'Please enter a payment amount before saving.',
        variant: 'error',
      })
      return
    }

    try {
      let apiMessage = ''
      if (activePayment) {
        const payment = await updatePaymentWithApi(activePayment.id, {
          amount,
          method,
          status,
          paidAt,
          staffId,
        })
        apiMessage = payment.apiMessage
      } else {
        const payment = await createPaymentWithApi({
          invoiceId,
          amount,
          method,
          status,
          paidAt,
          staffId,
        })
        apiMessage = payment.apiMessage
      }

      await reloadBilling()
      closePaymentModal()
      showToast({ title: 'Payment saved', message: apiMessage, variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save payment.'
      showToast({ title: 'Could not save payment', message, variant: 'error' })
    }
  }

  const handleDeleteInvoice = async (invoice: InvoiceRecord) => {
    const shouldDelete = await confirmToast({
      title: 'Delete invoice?',
      message: `Delete invoice ${invoice.code}?`,
      confirmLabel: 'Delete',
      variant: 'warning',
    })
    if (!shouldDelete) return

    try {
      const message = await deleteInvoiceWithApi(invoice.id)
      await reloadBilling()
      showToast({ title: 'Invoice deleted', message, variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete invoice.'
      showToast({ title: 'Could not delete invoice', message, variant: 'error' })
    }
  }

  const handleDeletePayment = async (payment: PaymentRecord) => {
    const shouldDelete = await confirmToast({
      title: 'Delete payment?',
      message: `Delete payment #${payment.id}?`,
      confirmLabel: 'Delete',
      variant: 'warning',
    })
    if (!shouldDelete) return

    try {
      const message = await deletePaymentWithApi(payment.id)
      await reloadBilling()
      showToast({ title: 'Payment deleted', message, variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete payment.'
      showToast({ title: 'Could not delete payment', message, variant: 'error' })
    }
  }

  return (
    <div className="admin-stack">
      <div className="metric-grid">
        <article className="metric-card">
          <span className="icon-tile">
            <Icon name="card" />
          </span>
          <p>Total Invoices</p>
          <strong>{invoices.length}</strong>
          <small>created billing records</small>
        </article>
        <article className="metric-card">
          <span className="icon-tile">
            <Icon name="check" />
          </span>
          <p>Paid Revenue</p>
          <strong>{paidRevenue.toLocaleString('vi-VN')} VND</strong>
          <small>successful payments</small>
        </article>
        <article className="metric-card">
          <span className="icon-tile">
            <Icon name="bell" />
          </span>
          <p>Open Balance</p>
          <strong>{unpaidTotal.toLocaleString('vi-VN')} VND</strong>
          <small>unpaid or partial</small>
        </article>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div className="panel-title">
            <Icon name="card" />
            <span>Invoice Management</span>
          </div>
          <button className="primary-button compact" type="button" onClick={() => openInvoiceModal()}>
            <Icon name="plus" />
            Add Invoice
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="flex-1 min-w-[240px]">
            <input
              value={invoiceSearch}
              placeholder="Search invoice, booking, guest..."
              onChange={(event) => setInvoiceSearch(event.target.value)}
            />
          </label>
          {(['All', 'unpaid', 'partial_paid', 'paid', 'cancelled'] as const).map((status) => (
            <button
              className={`ghost-button compact ${invoiceStatusFilter === status ? 'border-slate-500 text-white' : ''}`}
              key={status}
              type="button"
              onClick={() => setInvoiceStatusFilter(status)}
            >
              {status === 'All' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Booking</th>
                <th>Guest</th>
                <th>Issued</th>
                <th>Room</th>
                <th>Services</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <strong>{invoice.code}</strong>
                  </td>
                  <td>#{invoice.bookingId}</td>
                  <td>{invoice.guest}</td>
                  <td>{invoice.issuedDate}</td>
                  <td>{invoice.roomAmount}</td>
                  <td>{invoice.serviceAmount}</td>
                  <td>{invoice.totalAmount}</td>
                  <td>
                    <span className={`status-chip ${invoice.status === 'paid' ? 'success' : invoice.status === 'cancelled' ? 'failed' : 'pending'}`}>
                      {invoice.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="link-button" type="button" onClick={() => openInvoiceModal(invoice)}>
                        Edit
                      </button>
                      <button className="link-button" type="button" onClick={() => handleDeleteInvoice(invoice)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={9}>No invoices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div className="panel-title">
            <Icon name="shield" />
            <span>Payment Management</span>
          </div>
          <button className="primary-button compact" type="button" onClick={() => openPaymentModal()}>
            <Icon name="plus" />
            Add Payment
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="flex-1 min-w-[240px]">
            <input
              value={paymentSearch}
              placeholder="Search payment, invoice, staff..."
              onChange={(event) => setPaymentSearch(event.target.value)}
            />
          </label>
          {(['All', 'pending', 'success', 'failed', 'refunded'] as const).map((status) => (
            <button
              className={`ghost-button compact ${paymentStatusFilter === status ? 'border-slate-500 text-white' : ''}`}
              key={status}
              type="button"
              onClick={() => setPaymentStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Paid at</th>
                <th>Staff</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>#{payment.id}</td>
                  <td>{payment.invoiceCode}</td>
                  <td>{payment.amount}</td>
                  <td>{payment.method.replace('_', ' ')}</td>
                  <td>
                    <span className={`status-chip ${payment.status === 'success' ? 'success' : payment.status === 'failed' ? 'failed' : 'pending'}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>{payment.paidAt}</td>
                  <td>{payment.staffName}</td>
                  <td>
                    <div className="row-actions">
                      <button className="link-button" type="button" onClick={() => openPaymentModal(payment)}>
                        Edit
                      </button>
                      <button className="link-button" type="button" onClick={() => handleDeletePayment(payment)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={8}>No payments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isInvoiceModalOpen && (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="invoice-form-title">
            <div className="admin-modal-header">
              <div>
                <p className="eyebrow">Billing</p>
                <h2 id="invoice-form-title">{activeInvoice ? 'Edit Invoice' : 'Add Invoice'}</h2>
              </div>
              <button className="icon-button" type="button" aria-label="Close invoice form" onClick={closeInvoiceModal}>
                <Icon name="close" />
              </button>
            </div>
            <form className="admin-room-form" onSubmit={handleInvoiceSubmit}>
              <label>
                Booking ID
                <input name="bookingId" defaultValue={activeInvoice?.bookingId} disabled={Boolean(activeInvoice)} required={!activeInvoice} />
              </label>
              <label>
                Invoice code
                <input name="invoiceCode" defaultValue={activeInvoice?.code} disabled={Boolean(activeInvoice)} placeholder="Auto if empty" />
              </label>
              <label>
                Issued date
                <input name="issuedDate" type="date" disabled={Boolean(activeInvoice)} />
              </label>
              <label>
                Status
                <select name="status" defaultValue={activeInvoice?.status ?? 'unpaid'}>
                  <option value="unpaid">unpaid</option>
                  <option value="partial_paid">partial paid</option>
                  <option value="paid">paid</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </label>
              <label>
                Room amount
                <input name="roomAmount" placeholder="Auto from booking if empty" disabled={Boolean(activeInvoice)} />
              </label>
              <label>
                Service amount
                <input name="serviceAmount" placeholder="Auto from usages if empty" disabled={Boolean(activeInvoice)} />
              </label>
              <label className="span-2">
                Total amount
                <input name="totalAmount" defaultValue={activeInvoice ? parseAmount(activeInvoice.totalAmount) : ''} placeholder="Required only when editing total" />
              </label>
              <label className="span-2">
                Note
                <textarea name="note" defaultValue={activeInvoice?.note} rows={4} />
              </label>
              <div className="admin-modal-actions span-2">
                <button className="ghost-button" type="button" onClick={closeInvoiceModal}>
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  <Icon name={activeInvoice ? 'check' : 'plus'} />
                  {activeInvoice ? 'Update Invoice' : 'Save Invoice'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="payment-form-title">
            <div className="admin-modal-header">
              <div>
                <p className="eyebrow">Payment</p>
                <h2 id="payment-form-title">{activePayment ? 'Edit Payment' : 'Add Payment'}</h2>
              </div>
              <button className="icon-button" type="button" aria-label="Close payment form" onClick={closePaymentModal}>
                <Icon name="close" />
              </button>
            </div>
            <form className="admin-room-form" onSubmit={handlePaymentSubmit}>
              <label>
                Invoice ID
                <input name="invoiceId" defaultValue={activePayment?.invoiceId} disabled={Boolean(activePayment)} required={!activePayment} />
              </label>
              <label>
                Amount
                <input name="amount" defaultValue={activePayment ? parseAmount(activePayment.amount) : ''} required />
              </label>
              <label>
                Method
                <select name="method" defaultValue={activePayment?.method ?? 'cash'}>
                  <option value="cash">cash</option>
                  <option value="bank_transfer">bank transfer</option>
                  <option value="online">online</option>
                </select>
              </label>
              <label>
                Status
                <select name="status" defaultValue={activePayment?.status ?? 'pending'}>
                  <option value="pending">pending</option>
                  <option value="success">success</option>
                  <option value="failed">failed</option>
                  <option value="refunded">refunded</option>
                </select>
              </label>
              <label>
                Paid at
                <input name="paidAt" defaultValue={toDateTimeLocal(activePayment?.paidAt ?? '')} type="datetime-local" />
              </label>
              <label>
                Staff ID
                <input name="staffId" placeholder="Leave empty to use current admin" />
              </label>
              <div className="admin-modal-actions span-2">
                <button className="ghost-button" type="button" onClick={closePaymentModal}>
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  <Icon name={activePayment ? 'check' : 'plus'} />
                  {activePayment ? 'Update Payment' : 'Save Payment'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
