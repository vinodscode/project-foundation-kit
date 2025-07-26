
import AddLoanForm from "@/components/AddLoanForm";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddLoan = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen">
      <header className="py-4 px-4 border-b flex items-center">
        <button
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} className="mr-2" />
          <span>Back</span>
        </button>
        <h1 className="text-lg font-medium mx-auto">Add New Loan</h1>
        <div className="w-[72px]"></div>
      </header>
      
      <main className="page-container max-w-md">
        <AddLoanForm />
      </main>
    </div>
  );
};

export default AddLoan;
