type BadgeVariant =
  | "grammar"
  | "vocabulary"
  | "pronunciation"
  | "tone"
  | "style"
  | "minor"
  | "major"
  | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  grammar: "bg-blue-100 text-blue-800",
  vocabulary: "bg-purple-100 text-purple-800",
  pronunciation: "bg-orange-100 text-orange-800",
  tone: "bg-green-100 text-green-800",
  style: "bg-teal-100 text-teal-800",
  minor: "bg-yellow-100 text-yellow-800",
  major: "bg-red-100 text-red-800",
  default: "bg-gray-100 text-gray-800",
};

export default function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
