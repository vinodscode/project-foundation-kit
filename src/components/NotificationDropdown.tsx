import { useState, useMemo } from "react";
import { Bell, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  
  // Calculate interest reminders - assuming monthly interest due
  const reminders = useMemo(() => {
    const today = new Date();
    const reminderWindow = 7; // Show reminders for next 7 days
    const endDate = addDays(today, reminderWindow);
    
    const allReminders: Reminder[] = [];
    
    loans.forEach((loan) => {
      // Calculate monthly interest amount
      const monthlyInterest = (loan.amount * loan.interestRate) / 100 / 12;

      // Ensure startDate is a Date object
      const startDate = loan.startDate instanceof Date ? loan.startDate : new Date(loan.startDate);

      // Get the day of month from start date
      const startDay = startDate.getDate();
      
      // Check if interest is due in the next 7 days
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), startDay);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, startDay);
      
      [currentMonth, nextMonth].forEach((dueDate) => {
        if (isWithinInterval(dueDate, { start: startOfDay(today), end: endOfDay(endDate) })) {
          // Check if interest payment already made for this month
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
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full"
        >
          <Bell size={18} />
          {hasReminders && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {reminders.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Bell size={16} />
          Interest Reminders
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {reminders.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Clock size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming interest payments</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {reminders.map((reminder) => (
              <DropdownMenuItem
                key={reminder.id}
                className="flex items-start justify-between p-3 cursor-default"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{reminder.borrowerName}</span>
                    <Badge variant="outline" className="text-xs">
                      {format(reminder.dueDate, 'MMM dd')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Interest: {formatCurrency(reminder.interestAmount)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleMarkAsPaid(reminder)}
                  className="ml-2 h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Check size={16} />
                </Button>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
