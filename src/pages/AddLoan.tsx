import AddLoanForm from "@/components/AddLoanForm";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddLoan = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center h-14 px-4">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors -ml-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-base font-semibold mx-auto">Add New Loan</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto pb-20">
        <AddLoanForm />
      </main>
    </div>
  );
};

export default AddLoan;
