import Navbar from "./Navbar";
import Footer from "./Footer";

export const MainLayout = ({ 
  children, 
  showFooter = true,
  maxWidth = "7xl", // "full", "7xl", "6xl", "5xl", "4xl"
  noPadding = false 
}) => {
  const maxWidthClasses = {
    full: "max-w-full",
    "7xl": "max-w-7xl",
    "6xl": "max-w-6xl",
    "5xl": "max-w-5xl",
    "4xl": "max-w-4xl"
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <Navbar />
      
      <main className={`${maxWidthClasses[maxWidth]} mx-auto ${noPadding ? '' : 'px-4 sm:px-6 lg:px-8 py-6'}`}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;