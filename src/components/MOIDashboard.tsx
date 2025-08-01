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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">MOI Dashboard</h1>
        <p className="text-muted-foreground">Manage your MOI entries</p>
      </div>

      {/* Total MOI Summary Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 p-4 md:p-5 rounded-xl shadow-sm relative overflow-hidden border border-green-100 dark:border-gray-700">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-200/30 dark:bg-green-700/20 rounded-full blur-xl"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald-200/30 dark:bg-emerald-700/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500/20 dark:bg-green-500/30" style={{paddingBottom: '5px'}}>
              <span className="text-green-700 dark:text-green-300 text-xs font-bold">ரு</span>
            </div>
            <h2 className="text-xs sm:text-sm text-green-800 dark:text-green-300 uppercase tracking-wider font-medium">Total MOI</h2>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(getTotalMOI())}</p>
        </div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="space-y-2">
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
              
              <div className="flex gap-2">
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowForm(false)}
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
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="text-right font-semibold">Amount</TableHead>
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
                          {format(entry.date, "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {entry.description || "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCurrency(entry.amount)}
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