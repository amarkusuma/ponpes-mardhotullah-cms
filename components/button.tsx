import { cn } from '../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition',
        variant === 'primary' ? 'bg-slate-900 text-white hover:bg-slate-700' : 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
        className,
      )}
      {...props}
    />
  )
}
