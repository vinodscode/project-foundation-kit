import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { useLoanStore, formatCurrency } from "@/lib/store";
import { format } from "date-fns";

const MOIDashboard = () => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [name, setName] = useState("");

  const moiEntries = useLoanStore((state) => state.moiEntries);
  const addMoiEntry = useLoanStore((state) => state.addMoiEntry);
  const deleteMoiEntry = useLoanStore((state) => state.deleteMoiEntry);
  const getTotalMOI = useLoanStore((state) => state.getTotalMOI);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !date || !name.trim()) {
      return;
    }

    addMoiEntry({
      amount: parseFloat(amount),
      date,
      name: name.trim()
    });

    // Reset form
    setAmount("");
    setDate(new Date());
    setName("");
  };

  const handleDelete = (entryId: string) => {
    deleteMoiEntry(entryId);
  };

  return (
    <div className="space-y-6">
      {/* Total MOI Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total MOI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(getTotalMOI())}
          </div>
        </CardContent>
      </Card>

      {/* Add Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <DatePicker
                  date={date}
                  onDateChange={setDate}
                  placeholder="Select date"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>MOI Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {moiEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No entries yet. Add your first MOI entry above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moiEntries
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(entry.date, "MMM dd, yyyy")}</TableCell>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MOIDashboard;