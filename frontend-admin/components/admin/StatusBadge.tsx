'use client'

interface StatusBadgeProps {
  status: string
  type?: 'application' | 'interest' | 'user'
}

const applicationColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  appraisal_ordered: 'bg-orange-100 text-orange-700',
  appraisal_complete: 'bg-teal-100 text-teal-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-700',
  matching: 'bg-purple-100 text-purple-700',
  funded: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-gray-100 text-gray-700',
}

const interestColors: Record<string, string> = {
  expressed: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-yellow-100 text-yellow-700',
  committed: 'bg-green-100 text-green-700',
  withdrawn: 'bg-gray-100 text-gray-700',
  declined: 'bg-red-100 text-red-700',
}

const userColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700',
}

function getColorClasses(status: string, type?: string): string {
  if (type === 'interest') return interestColors[status] || 'bg-gray-100 text-gray-700'
  if (type === 'user') return userColors[status] || 'bg-gray-100 text-gray-700'
  return applicationColors[status] || 'bg-gray-100 text-gray-700'
}

function formatLabel(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const colors = getColorClasses(status, type)
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors}`}
    >
      {formatLabel(status)}
    </span>
  )
}
