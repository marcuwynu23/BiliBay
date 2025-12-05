export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({children, className}) => {
  return <div className={className}>{children}</div>;
};
