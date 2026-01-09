import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  showArrow?: boolean;
}

export const GradientButton = ({
  children,
  isLoading = false,
  showArrow = true,
  className = '',
  disabled,
  ...props
}: GradientButtonProps) => {
  return (
    <button
      className={`
        relative w-full px-6 py-4 rounded-[2rem]
        bg-black text-white font-medium text-lg
        transition-all duration-300
        hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        overflow-hidden
        group
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-[2rem] p-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      <div className="absolute inset-[2px] rounded-[2rem] bg-black z-0" />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <span>{children}</span>
            {showArrow && <ArrowRight className="w-5 h-5" />}
          </>
        )}
      </span>
    </button>
  );
};
