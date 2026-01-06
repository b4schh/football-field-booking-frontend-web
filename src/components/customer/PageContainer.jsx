export default function PageContainer({ children }) {
  return (
    <div className="container mx-auto px-4 lg:px-20">
      {children}
    </div>
  );
}
