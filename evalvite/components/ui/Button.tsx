import { clsx } from 'clsx';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        {
          'bg-ink text-paper hover:bg-brick active:bg-brick-dark rounded-xl': variant === 'primary',
          'bg-transparent text-ink border-[1.5px] border-ink hover:bg-ink hover:text-paper rounded-xl':
            variant === 'secondary',
          'bg-transparent text-ink-soft hover:text-ink rounded-lg': variant === 'ghost',
          'px-3 py-1.5 text-sm gap-1.5': size === 'sm',
          'px-5 py-2.5 text-base gap-2': size === 'md',
          'px-7 py-3.5 text-lg gap-2': size === 'lg',
        },
        className,
      )}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
