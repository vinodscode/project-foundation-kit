import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, X } from "lucide-react";
import { useLoanStore, formatCurrency } from "@/lib/store";
import { format } from "date-fns";

const MOIDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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
      name: name.trim(),
      description: description.trim() || undefined
    });

    // Reset form
    setAmount("");
    setDate(new Date());
    setName("");
    setDescription("");
    setShowForm(false);
  };

  const handleDelete = (entryId: string) => {
    deleteMoiEntry(entryId);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">MOI Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Manage your MOI entries</p>
      </div>

      {/* Add Entry Section */}
      <Card>
        <CardHeader>
          <CardTitle>Entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">New Entry</h3>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setAmount("");
                    setDate(new Date());
                    setName("");
                    setDescription("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description (optional)"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="flex-1 sm:flex-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Entries Table */}
          {moiEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No entries yet. Add your first MOI entry above.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold min-w-[100px]">Date</TableHead>
                    <TableHead className="font-semibold min-w-[120px]">Name</TableHead>
                    <TableHead className="font-semibold min-w-[150px] hidden sm:table-cell">Description</TableHead>
                    <TableHead className="text-right font-semibold min-w-[100px]">Amount</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moiEntries
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((entry) => (
                      <TableRow 
                        key={entry.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="text-sm sm:text-base">
                            {format(entry.date, "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="text-sm sm:text-base">{entry.name}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">
                            {entry.description || "No description"}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate hidden sm:table-cell">
                          {entry.description || "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          <div className="text-sm sm:text-base">
                            {formatCurrency(entry.amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MOIDashboard;
