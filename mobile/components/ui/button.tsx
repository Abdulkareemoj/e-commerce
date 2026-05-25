import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, Pressable } from 'react-native';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-xl shadow-sm',
    Platform.select({
      web: "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none transition-all duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-primary shadow-lg shadow-primary/25 active:scale-[0.98] active:shadow-md',
          Platform.select({
            web: 'hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]',
          })
        ),
        destructive: cn(
          'bg-destructive shadow-sm shadow-destructive/25 active:scale-[0.98] active:bg-destructive/90',
          Platform.select({
            web: 'hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/30 active:scale-[0.98]',
          })
        ),
        outline: cn(
          'border-2 border-border bg-background shadow-sm shadow-black/5 active:scale-[0.98] active:bg-accent/50',
          Platform.select({
            web: 'hover:border-primary/50 hover:bg-accent/50 hover:shadow-md active:scale-[0.98]',
          })
        ),
        secondary: cn(
          'bg-secondary shadow-sm shadow-black/5 active:scale-[0.98] active:bg-secondary/80',
          Platform.select({ web: 'hover:bg-secondary/90 hover:shadow-md active:scale-[0.98]' })
        ),
        ghost: cn('active:bg-accent/50', Platform.select({ web: 'hover:bg-accent/30' })),
        link: '',
      },
      size: {
        default: cn('h-11 px-5 py-2.5 sm:h-10', Platform.select({ web: 'has-[>svg]:px-4' })),
        sm: cn('h-10 gap-2 rounded-lg px-4 sm:h-9', Platform.select({ web: 'has-[>svg]:px-3' })),
        lg: cn('h-13 rounded-xl px-8 py-3.5 sm:h-11', Platform.select({ web: 'has-[>svg]:px-5' })),
        icon: 'h-11 w-11 rounded-xl sm:h-10 sm:w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  cn(
    'text-sm font-medium text-foreground',
    Platform.select({ web: 'pointer-events-none transition-colors' })
  ),
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        destructive: 'text-white',
        outline: cn(
          'group-active:text-accent-foreground',
          Platform.select({ web: 'group-hover:text-accent-foreground' })
        ),
        secondary: 'text-secondary-foreground',
        ghost: 'group-active:text-accent-foreground',
        link: cn(
          'text-primary group-active:underline',
          Platform.select({ web: 'underline-offset-4 hover:underline group-hover:underline' })
        ),
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(props.disabled && 'opacity-50', buttonVariants({ variant, size }), className)}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
