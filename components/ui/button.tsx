import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils/cn';
const styles = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
  { variants: {
    variant: { default: 'bg-primary text-primary-foreground hover:opacity-90', outline: 'border bg-transparent text-foreground hover:bg-secondary', ghost: 'hover:bg-secondary', destructive: 'bg-destructive text-destructive-foreground' },
    size: { default: 'px-5', sm: 'px-3', lg: 'px-7' },
  }, defaultVariants: { variant: 'default', size: 'default' } },
);
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof styles> & { asChild?: boolean };
const Button = React.forwardRef<HTMLButtonElement, Props>(({className, variant, size, asChild=false, ...props}, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} className={cn(styles({variant,size}),className)} {...props} />;
});
Button.displayName='Button';
export {Button,styles as buttonVariants};
