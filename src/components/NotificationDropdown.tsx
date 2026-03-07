import { useMemo } from "react";
import { Bell, Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useLoanStore, formatCurrency } from "@/lib/store";
import { addDays, format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

interface Reminder {
  id: string;
  borrowerName: string;
  interestAmount: number;
  dueDate: Date;
  loanId: string;
}

const NotificationDropdown = () => {
  const loans = useLoanStore((state) => state.loans);
  const addPayment = useLoanStore((state) => state.addPayment);
  const getRemainingPrincipal = useLoanStore((state) => state.getRemainingPrincipal);

  const reminders = useMemo(() => {
    const today = new Date();
    const endDate = addDays(today, 7);
    const allReminders: Reminder[] = [];

    loans.forEach((loan) => {
      const remainingBalance = getRemainingPrincipal(loan.id);
      if (remainingBalance <= 0) return;

      const monthlyInterest = (remainingBalance * loan.interestRate) / 100 / 12;
      const startDate = loan.startDate instanceof Date ? loan.startDate : new Date(loan.startDate);
      const startDay = startDate.getDate();
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), startDay);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, startDay);

      [currentMonth, nextMonth].forEach((dueDate) => {
        if (isWithinInterval(dueDate, { start: startOfDay(today), end: endOfDay(endDate) })) {
          const hasPaymentThisMonth = loan.payments.some((payment) => {
            const paymentDate = payment.date instanceof Date ? payment.date : new Date(payment.date);
            return (
              payment.type === 'interest' &&
              paymentDate.getMonth() === dueDate.getMonth() &&
              paymentDate.getFullYear() === dueDate.getFullYear()
            );
          });

          if (!hasPaymentThisMonth) {
            allReminders.push({
              id: `${loan.id}-${dueDate.toISOString()}`,
              borrowerName: loan.borrowerName,
              interestAmount: monthlyInterest,
              dueDate,
              loanId: loan.id,
            });
          }
        }
      });
    });

    return allReminders.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [loans]);

  const handleMarkAsPaid = async (reminder: Reminder) => {
    try {
      await addPayment(reminder.loanId, {
        amount: reminder.interestAmount,
        date: new Date(),
        type: 'interest',
        notes: `Interest payment for ${format(reminder.dueDate, 'MMMM yyyy')}`,
      });
    } catch (error) {
      console.error('Error adding interest payment:', error);
    }
  };

  const hasReminders = reminders.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100/60 dark:bg-white/10 hover:bg-gray-200/60 dark:hover:bg-white/20 transition-colors border border-gray-200/50 dark:border-white/10">
          <Bell size={16} className="text-gray-600 dark:text-gray-300" />
          {hasReminders && (
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {reminders.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl">
        <DropdownMenuLabel className="flex items-center gap-2 text-sm">
          <Bell size={14} />
          Interest Reminders
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {reminders.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <Clock size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-muted-foreground">No upcoming payments</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {reminders.map((reminder) => (
              <DropdownMenuItem
                key={reminder.id}
                className="flex items-start justify-between p-3 cursor-default rounded-lg mx-1"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{reminder.borrowerName}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-md">
                      {format(reminder.dueDate, 'MMM dd')}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                    {formatCurrency(reminder.interestAmount)}
                  </p>
                </div>
                <button
                  onClick={() => handleMarkAsPaid(reminder)}
                  className="ml-2 w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors shrink-0"
                >
                  <Check size={16} />
                </button>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
