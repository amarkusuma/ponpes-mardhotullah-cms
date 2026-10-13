'use client'

// Loaded only client-side via dynamic() — no SSR
import { CKEditor } from '@ckeditor/ckeditor5-react'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ClassicEditor = require('@ckeditor/ckeditor5-build-classic')

interface Props {
  value: string
  onChange: (val: string) => void
  disabled?: boolean
}

export default function CKEditorField({ value, onChange, disabled }: Props) {
  return (
    <div className="ck-editor-wrapper">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        disabled={disabled}
        onChange={(_event: unknown, editor: { getData: () => string }) => {
          onChange(editor.getData())
        }}
        config={{
          toolbar: [
            'heading', '|',
            'bold', 'italic', 'underline', 'link', '|',
            'bulletedList', 'numberedList', '|',
            'blockQuote', 'insertTable', '|',
            'undo', 'redo',
          ],
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
              { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            ],
          },
        }}
      />
    </div>
  )
}
