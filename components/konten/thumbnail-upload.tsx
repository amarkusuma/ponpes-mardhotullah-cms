'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

const MAX_SIZE = 5 * 1024 * 1024

interface ThumbnailUploadProps {
  value?: string
  onChange: (url: string) => void
  /** Uploads the file and resolves to its public URL */
  upload: (file: File) => Promise<string>
  onUploadingChange?: (uploading: boolean) => void
  /** Text shown in the empty state, e.g. "Klik untuk upload gambar banner" */
  emptyText?: string
  className?: string
}

// 16:9 click-to-upload thumbnail with preview, replace on hover and a remove button.
export default function ThumbnailUpload({
  value,
  onChange,
  upload,
  onUploadingChange,
  emptyText = 'Klik untuk upload thumbnail',
  className = 'max-w-sm',
}: ThumbnailUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  function setBusy(busy: boolean) {
    setUploading(busy)
    onUploadingChange?.(busy)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_SIZE) {
      toast.error('Ukuran gambar maksimal 5MB')
      return
    }
    setBusy(true)
    try {
      onChange(await upload(file))
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal mengupload gambar'
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div
        className={`relative w-full ${className} rounded-lg border-2 border-dashed border-muted-foreground/30 overflow-hidden bg-muted/30 cursor-pointer hover:border-primary/50 transition-colors`}
        style={{ aspectRatio: '16/9' }}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="thumbnail" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
              <span className="text-white text-sm ml-2">Ganti gambar</span>
            </div>
            <button
              type="button"
              aria-label="Hapus gambar"
              className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImagePlus className="h-8 w-8" />
            <p className="text-sm">{emptyText}</p>
            <p className="text-xs">JPG, PNG, WebP, GIF • maks 5MB</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <p className="text-white text-sm animate-pulse">Mengupload...</p>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  )
}
