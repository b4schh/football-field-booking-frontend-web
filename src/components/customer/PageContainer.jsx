export default function PageContainer({ children }) {
  return (
    <div className="container mx-auto px-4 lg:px-8">
      {children}
    </div>
  );
}
