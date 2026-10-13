'use client'

import dynamic from 'next/dynamic'

const CKEditorField = dynamic(() => import('./CKEditorField'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[250px] rounded-md border border-input bg-muted/30 animate-pulse" />
  ),
})

export default CKEditorField
