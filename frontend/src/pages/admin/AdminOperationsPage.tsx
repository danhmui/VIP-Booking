import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createCheckInOutWithApi,
  createServiceUsageWithApi,
  deleteCheckInOutWithApi,
  deleteServiceUsageWithApi,
  fetchCheckInOuts,
  fetchServiceUsages,
  updateCheckInOutWithApi,
  updateServiceUsageWithApi,
} from '../../api/vipBookingApi'
import { Icon } from '../../components/icons/Icon'
import { useToast } from '../../context/ToastContext'
import type { CheckInOutRecord, ServiceUsageRecord } from '../../types'

function normalizeQuery(value: string) {
  return value.trim().toLowerCase()
}

function toDateTimeLocal(value: string) {
  if (!value || value === '-') return ''
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 16)
}

export function AdminOperationsPage() {
  const { confirmToast, showToast } = useToast()
  const [checkInOuts, setCheckInOuts] = useState<CheckInOutRecord[]>([])
  const [serviceUsages, setServiceUsages] = useState<ServiceUsageRecord[]>([])
  const [checkInSearch, setCheckInSearch] = useState('')
  const [serviceSearch, setServiceSearch] = useState('')
  const [operationFilter, setOperationFilter] = useState<'All' | CheckInOutRecord['status']>('All')
  const [activeCheckInOut, setActiveCheckInOut] = useState<CheckInOutRecord | null>(null)
  const [activeServiceUsage, setActiveServiceUsage] = useState<ServiceUsageRecord | null>(null)
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false)
  const [isServiceUsageModalOpen, setIsServiceUsageModalOpen] = useState(false)

  const reloadOperations = async () => {
    const [nextCheckInOuts, nextServiceUsages] = await Promise.all([
      fetchCheckInOuts(),
      fetchServiceUsages(),
    ])
    setCheckInOuts(nextCheckInOuts)
    setServiceUsages(nextServiceUsages)
  }

  useEffect(() => {
    reloadOperations().catch((error) => {
      const message = error instanceof Error ? error.message : 'Could not load hotel operations.'
      showToast({ title: 'Could not load hotel operations', message, variant: 'error' })
    })
  }, [showToast])

  const filteredCheckInOuts = useMemo(() => {
    const query = normalizeQuery(checkInSearch)

    return checkInOuts.filter((record) => {
      const statusMatch = operationFilter === 'All' || record.status === operationFilter
      const textMatch =
        !query ||
        record.id.toLowerCase().includes(query) ||
        record.bookingId.toLowerCase().includes(query) ||
        record.roomLabel.toLowerCase().includes(query) ||
        record.staffName.toLowerCase().includes(query)

      return statusMatch && textMatch
    })
  }, [checkInOuts, checkInSearch, operationFilter])

  const filteredServiceUsages = useMemo(() => {
    const query = normalizeQuery(serviceSearch)

    return serviceUsages.filter((usage) => {
      return (
        !query ||
        usage.id.toLowerCase().includes(query) ||
        usage.bookingId.toLowerCase().includes(query) ||
        usage.serviceName.toLowerCase().includes(query) ||
        usage.note.toLowerCase().includes(query)
      )
    })
  }, [serviceSearch, serviceUsages])

  const openCheckInModal = (record?: CheckInOutRecord) => {
    setActiveCheckInOut(record ?? null)
    setIsCheckInModalOpen(true)
  }

  const openServiceUsageModal = (usage?: ServiceUsageRecord) => {
    setActiveServiceUsage(usage ?? null)
    setIsServiceUsageModalOpen(true)
  }

  const closeCheckInModal = () => {
    setActiveCheckInOut(null)
    setIsCheckInModalOpen(false)
  }

  const closeServiceUsageModal = () => {
    setActiveServiceUsage(null)
    setIsServiceUsageModalOpen(false)
  }

  const handleCheckInSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const bookingId = String(formData.get('bookingId') ?? activeCheckInOut?.bookingId ?? '').trim()
    const roomId = String(formData.get('roomId') ?? activeCheckInOut?.roomId ?? '').trim()
    const staffId = String(formData.get('staffId') ?? '').trim()
    const checkInTime = String(formData.get('checkInTime') ?? '').trim()
    const checkOutTime = String(formData.get('checkOutTime') ?? '').trim()
    const status = String(formData.get('status') ?? 'checked_in') as CheckInOutRecord['status']
    const note = String(formData.get('note') ?? '').trim()

    if (!bookingId || !roomId) {
      showToast({
        title: 'Operation is incomplete',
        message: 'Booking ID and Room ID are required for check-in/out records.',
        variant: 'error',
      })
      return
    }

    try {
      let apiMessage = ''
      if (activeCheckInOut) {
        const record = await updateCheckInOutWithApi(activeCheckInOut.id, {
          roomId,
          staffId,
          checkInTime,
          checkOutTime: checkOutTime || null,
          status,
          note,
        })
        apiMessage = record.apiMessage
      } else {
        const record = await createCheckInOutWithApi({
          bookingId,
          roomId,
          staffId,
          checkInTime,
          checkOutTime: checkOutTime || null,
          status,
          note,
        })
        apiMessage = record.apiMessage
      }

      await reloadOperations()
      closeCheckInModal()
      showToast({ title: 'Operation saved', message: apiMessage, variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save check-in/out record.'
      showToast({ title: 'Could not save operation', message, variant: 'error' })
    }
  }

  const handleServiceUsageSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const bookingId = String(formData.get('bookingId') ?? '').trim()
    const serviceId = String(formData.get('serviceId') ?? '').trim()
    const quantity = Number(formData.get('quantity') ?? 0)
    const unitPrice = String(formData.get('unitPrice') ?? '').trim()
    const usedAt = String(formData.get('usedAt') ?? '').trim()
    const note = String(formData.get('note') ?? '').trim()

    if (!serviceId || quantity <= 0) {
      showToast({
        title: 'Service usage is incomplete',
        message: 'Service ID and valid quantity are required for service usage.',
        variant: 'error',
      })
      return
    }

    try {
      let apiMessage = ''
      if (activeServiceUsage) {
        const usage = await updateServiceUsageWithApi(activeServiceUsage.id, {
          bookingId: bookingId || null,
          serviceId,
          quantity,
          unitPrice,
          usedAt,
          note,
        })
        apiMessage = usage.apiMessage
      } else {
        const usage = await createServiceUsageWithApi({
          bookingId: bookingId || null,
          serviceId,
          quantity,
          unitPrice,
          usedAt,
          note,
        })
        apiMessage = usage.apiMessage
      }

      await reloadOperations()
      closeServiceUsageModal()
      showToast({ title: 'Service usage saved', message: apiMessage, variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save service usage.'
      showToast({ title: 'Could not save service usage', message, variant: 'error' })
    }
  }

  const handleDeleteCheckInOut = async (record: CheckInOutRecord) => {
    const shouldDelete = await confirmToast({
      title: 'Delete operation record?',
      message: `Delete operation record #${record.id}?`,
      confirmLabel: 'Delete',
      variant: 'warning',
    })
    if (!shouldDelete) return

    try {
      const message = await deleteCheckInOutWithApi(record.id)
      await reloadOperations()
      showToast({ title: 'Operation deleted', message, variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete check-in/out record.'
      showToast({ title: 'Could not delete operation', message, variant: 'error' })
    }
  }

  const handleDeleteServiceUsage = async (usage: ServiceUsageRecord) => {
    const shouldDelete = await confirmToast({
      title: 'Delete service usage?',
      message: `Delete service usage #${usage.id}?`,
      confirmLabel: 'Delete',
      variant: 'warning',
    })
    if (!shouldDelete) return

    try {
      const message = await deleteServiceUsageWithApi(usage.id)
      await reloadOperations()
      showToast({ title: 'Service usage deleted', message, variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete service usage.'
      showToast({ title: 'Could not delete service usage', message, variant: 'error' })
    }
  }

  return (
    <div className="admin-stack">
      <div className="metric-grid">
        <article className="metric-card">
          <span className="icon-tile">
            <Icon name="bed" />
          </span>
          <p>Checked In</p>
          <strong>{checkInOuts.filter((record) => record.status === 'checked_in').length}</strong>
          <small>active in-house stays</small>
        </article>
        <article className="metric-card">
          <span className="icon-tile">
            <Icon name="check" />
          </span>
          <p>Checked Out</p>
          <strong>{checkInOuts.filter((record) => record.status === 'checked_out').length}</strong>
          <small>completed operations</small>
        </article>
        <article className="metric-card">
          <span className="icon-tile">
            <Icon name="service" />
          </span>
          <p>Service Usages</p>
          <strong>{serviceUsages.length}</strong>
          <small>charged stay services</small>
        </article>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div className="panel-title">
            <Icon name="bed" />
            <span>Check-in / Check-out</span>
          </div>
          <button className="primary-button compact" type="button" onClick={() => openCheckInModal()}>
            <Icon name="plus" />
            Add Operation
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="flex-1 min-w-[240px]">
            <input
              value={checkInSearch}
              placeholder="Search booking, room, staff..."
              onChange={(event) => setCheckInSearch(event.target.value)}
            />
          </label>
          {(['All', 'checked_in', 'checked_out'] as const).map((status) => (
            <button
              className={`ghost-button compact ${operationFilter === status ? 'border-slate-500 text-white' : ''}`}
              key={status}
              type="button"
              onClick={() => setOperationFilter(status)}
            >
              {status === 'All' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Booking</th>
                <th>Room</th>
                <th>Staff</th>
                <th>Check in</th>
                <th>Check out</th>
                <th>Status</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCheckInOuts.map((record) => (
                <tr key={record.id}>
                  <td>#{record.id}</td>
                  <td>#{record.bookingId}</td>
                  <td>{record.roomLabel}</td>
                  <td>{record.staffName}</td>
                  <td>{record.checkInTime}</td>
                  <td>{record.checkOutTime}</td>
                  <td>
                    <span className={`status-chip ${record.status === 'checked_in' ? 'pending' : 'success'}`}>
                      {record.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{record.note || '-'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="link-button" type="button" onClick={() => openCheckInModal(record)}>
                        Edit
                      </button>
                      <button className="link-button" type="button" onClick={() => handleDeleteCheckInOut(record)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCheckInOuts.length === 0 && (
                <tr>
                  <td colSpan={9}>No check-in/out records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div className="panel-title">
            <Icon name="service" />
            <span>Service Usage</span>
          </div>
          <button className="primary-button compact" type="button" onClick={() => openServiceUsageModal()}>
            <Icon name="plus" />
            Add Usage
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="flex-1 min-w-[240px]">
            <input
              value={serviceSearch}
              placeholder="Search booking, service, note..."
              onChange={(event) => setServiceSearch(event.target.value)}
            />
          </label>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Booking</th>
                <th>Service</th>
                <th>Qty</th>
                <th>Unit price</th>
                <th>Subtotal</th>
                <th>Used at</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServiceUsages.map((usage) => (
                <tr key={usage.id}>
                  <td>#{usage.id}</td>
                  <td>{usage.bookingId ? `#${usage.bookingId}` : '-'}</td>
                  <td>{usage.serviceName}</td>
                  <td>{usage.quantity}</td>
                  <td>{usage.unitPrice}</td>
                  <td>{usage.subtotal}</td>
                  <td>{usage.usedAt}</td>
                  <td>{usage.note || '-'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="link-button" type="button" onClick={() => openServiceUsageModal(usage)}>
                        Edit
                      </button>
                      <button className="link-button" type="button" onClick={() => handleDeleteServiceUsage(usage)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredServiceUsages.length === 0 && (
                <tr>
                  <td colSpan={9}>No service usage records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isCheckInModalOpen && (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="operation-form-title">
            <div className="admin-modal-header">
              <div>
                <p className="eyebrow">Hotel operations</p>
                <h2 id="operation-form-title">{activeCheckInOut ? 'Edit Operation' : 'Add Operation'}</h2>
              </div>
              <button className="icon-button" type="button" aria-label="Close operation form" onClick={closeCheckInModal}>
                <Icon name="close" />
              </button>
            </div>
            <form className="admin-room-form" onSubmit={handleCheckInSubmit}>
              <label>
                Booking ID
                <input name="bookingId" defaultValue={activeCheckInOut?.bookingId} disabled={Boolean(activeCheckInOut)} required />
              </label>
              <label>
                Room ID
                <input name="roomId" defaultValue={activeCheckInOut?.roomId} required />
              </label>
              <label>
                Staff ID
                <input name="staffId" placeholder="Leave empty to use current admin" />
              </label>
              <label>
                Status
                <select name="status" defaultValue={activeCheckInOut?.status ?? 'checked_in'}>
                  <option value="checked_in">checked in</option>
                  <option value="checked_out">checked out</option>
                </select>
              </label>
              <label>
                Check-in time
                <input name="checkInTime" defaultValue={toDateTimeLocal(activeCheckInOut?.checkInTime ?? '')} type="datetime-local" />
              </label>
              <label>
                Check-out time
                <input name="checkOutTime" defaultValue={toDateTimeLocal(activeCheckInOut?.checkOutTime ?? '')} type="datetime-local" />
              </label>
              <label className="span-2">
                Note
                <textarea name="note" defaultValue={activeCheckInOut?.note} rows={4} />
              </label>
              <div className="admin-modal-actions span-2">
                <button className="ghost-button" type="button" onClick={closeCheckInModal}>
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  <Icon name={activeCheckInOut ? 'check' : 'plus'} />
                  {activeCheckInOut ? 'Update Operation' : 'Save Operation'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {isServiceUsageModalOpen && (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="service-usage-form-title">
            <div className="admin-modal-header">
              <div>
                <p className="eyebrow">Stay services</p>
                <h2 id="service-usage-form-title">{activeServiceUsage ? 'Edit Service Usage' : 'Add Service Usage'}</h2>
              </div>
              <button className="icon-button" type="button" aria-label="Close service usage form" onClick={closeServiceUsageModal}>
                <Icon name="close" />
              </button>
            </div>
            <form className="admin-room-form" onSubmit={handleServiceUsageSubmit}>
              <label>
                Booking ID
                <input name="bookingId" defaultValue={activeServiceUsage?.bookingId} placeholder="Optional" />
              </label>
              <label>
                Service ID
                <input name="serviceId" defaultValue={activeServiceUsage?.serviceId} required />
              </label>
              <label>
                Quantity
                <input name="quantity" defaultValue={activeServiceUsage?.quantity ?? 1} min="1" required type="number" />
              </label>
              <label>
                Unit price
                <input name="unitPrice" placeholder="Leave empty to use service price" />
              </label>
              <label className="span-2">
                Used at
                <input name="usedAt" defaultValue={toDateTimeLocal(activeServiceUsage?.usedAt ?? '')} type="datetime-local" />
              </label>
              <label className="span-2">
                Note
                <textarea name="note" defaultValue={activeServiceUsage?.note} rows={4} />
              </label>
              <div className="admin-modal-actions span-2">
                <button className="ghost-button" type="button" onClick={closeServiceUsageModal}>
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  <Icon name={activeServiceUsage ? 'check' : 'plus'} />
                  {activeServiceUsage ? 'Update Usage' : 'Save Usage'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
