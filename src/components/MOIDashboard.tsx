import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Plus, X, Search, ArrowUpCircle, ArrowDownCircle, Users, Pencil, History, Clock } from "lucide-react";
import { useLoanStore, formatCurrency, MOITransaction, MOIEditRecord } from "@/lib/store";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const FUNCTION_TYPES = [
  { value: "Wedding", label: "Wedding (திருமணம்)" },
  { value: "Housewarming", label: "Housewarming (கிரகப்பிரவேசம்)" },
  { value: "Engagement", label: "Engagement (நிச்சயதார்த்தம்)" },
  { value: "EarPiercing", label: "Ear Piercing (காதுகுத்து)" },
  { value: "Cradle", label: "Cradle Ceremony (தொட்டில்)" },
  { value: "ThreadCeremony", label: "Thread Ceremony (பூணூல்)" },
  { value: "Birthday", label: "Birthday (பிறந்தநாள்)" },
  { value: "BabyShower", label: "Baby Shower (வளைகாப்பு)" },
  { value: "Death", label: "Death Ceremony (இறுதி)" },
  { value: "Other", label: "Other (மற்றவை)" },
];

const RELATIONSHIPS = [
  "Father", "Mother", "Brother", "Sister", "Uncle", "Aunt",
  "Grandfather", "Grandmother", "Cousin", "Friend", "Neighbor",
  "Colleague", "Father-in-law", "Mother-in-law", "Brother-in-law",
  "Sister-in-law", "Other",
];

const functionTypeLabel = (val: string) =>
  FUNCTION_TYPES.find(f => f.value === val)?.label ?? val;

const FIELD_LABELS: Record<string, string> = {
  type: 'Type',
  personName: 'Person Name',
  relationship: 'Relationship',
  functionType: 'Function Type',
  functionName: 'Event Name',
  functionDate: 'Date',
  amount: 'Amount',
  notes: 'Notes',
};

interface FormState {
  type: 'given' | 'received';
  personName: string;
  relationship: string;
  functionType: string;
  functionName: string;
  functionDate: Date | undefined;
  amount: string;
  notes: string;
}

const defaultForm = (): FormState => ({
  type: 'given',
  personName: '',
  relationship: '',
  functionType: '',
  functionName: '',
  functionDate: new Date(),
  amount: '',
  notes: '',
});

const MOIDashboard = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState<MOITransaction | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'given' | 'received'>('all');
  const [filterFunction, setFilterFunction] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [historyTx, setHistoryTx] = useState<MOITransaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moiTransactions = useLoanStore((state) => state.moiTransactions);
  const moiLoading = useLoanStore((state) => state.moiLoading);
  const fetchMoiTransactions = useLoanStore((state) => state.fetchMoiTransactions);
  const addMoiTransaction = useLoanStore((state) => state.addMoiTransaction);
  const updateMoiTransaction = useLoanStore((state) => state.updateMoiTransaction);
  const deleteMoiTransaction = useLoanStore((state) => state.deleteMoiTransaction);

  useEffect(() => {
    fetchMoiTransactions();
  }, [fetchMoiTransactions]);

  const personSummary = useMemo(() => {
    const map = new Map<string, { given: number; received: number; relationship?: string }>();
    moiTransactions.forEach(tx => {
      const existing = map.get(tx.personName) ?? { given: 0, received: 0, relationship: tx.relationship };
      if (tx.type === 'given') existing.given += tx.amount;
      else existing.received += tx.amount;
      map.set(tx.personName, existing);
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data, net: data.received - data.given }))
      .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  }, [moiTransactions]);

  const filtered = useMemo(() => {
    return moiTransactions.filter(tx => {
      const matchSearch = !search || tx.personName.toLowerCase().includes(search.toLowerCase()) ||
        (tx.functionName ?? '').toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || tx.type === filterType;
      const matchFunction = filterFunction === 'all' || tx.functionType === filterFunction;
      return matchSearch && matchType && matchFunction;
    });
  }, [moiTransactions, search, filterType, filterFunction]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.personName.trim()) e.personName = "Name required";
    if (!form.functionType) e.functionType = "Select a function type";
    if (!form.functionDate) e.functionDate = "Select a date";
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) e.amount = "Enter a valid amount";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openEditForm = (tx: MOITransaction) => {
    setEditingTx(tx);
    setForm({
      type: tx.type,
      personName: tx.personName,
      relationship: tx.relationship ?? '',
      functionType: tx.functionType,
      functionName: tx.functionName ?? '',
      functionDate: new Date(tx.functionDate),
      amount: tx.amount.toString(),
      notes: tx.notes ?? '',
    });
    setErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTx(null);
    setForm(defaultForm());
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (editingTx) {
        await updateMoiTransaction(editingTx.id, {
          type: form.type,
          personName: form.personName.trim(),
          relationship: form.relationship || undefined,
          functionType: form.functionType,
          functionName: form.functionName.trim() || undefined,
          functionDate: form.functionDate!,
          amount: parseFloat(form.amount),
          notes: form.notes.trim() || undefined,
        });
        toast({
          title: "Transaction updated",
          description: `MOI entry for ${form.personName} has been updated.`,
        });
      } else {
        await addMoiTransaction({
          type: form.type,
          personName: form.personName.trim(),
          relationship: form.relationship || undefined,
          functionType: form.functionType,
          functionName: form.functionName.trim() || undefined,
          functionDate: form.functionDate!,
          amount: parseFloat(form.amount),
          notes: form.notes.trim() || undefined,
        });
        toast({
          title: "Transaction added",
          description: `MOI ${form.type === 'given' ? 'given to' : 'received from'} ${form.personName} recorded.`,
        });
      }
      closeForm();
    } catch {
      toast({ title: editingTx ? "Failed to update" : "Failed to add", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMoiTransaction(deleteId);
      toast({ title: "Transaction deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => { setEditingTx(null); setForm(defaultForm()); setShowForm(true); }}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-3 rounded-2xl transition-colors"
        >
          <Plus size={16} />
          Add MOI Transaction
        </button>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-blue-100 dark:border-blue-900/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">
              {editingTx ? 'Edit Transaction' : 'New Transaction'}
            </h3>
            <button
              onClick={closeForm}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Toggle */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, type: 'given' }))}
                className={cn(
                  "flex flex-col items-center justify-center h-14 rounded-xl gap-1 border-2 transition-all",
                  form.type === 'given'
                    ? "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-500"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-red-300"
                )}
              >
                <ArrowUpCircle size={18} />
                <span className="text-[11px] font-semibold">Given</span>
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, type: 'received' }))}
                className={cn(
                  "flex flex-col items-center justify-center h-14 rounded-xl gap-1 border-2 transition-all",
                  form.type === 'received'
                    ? "bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-300 dark:border-green-500"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-green-300"
                )}
              >
                <ArrowDownCircle size={18} />
                <span className="text-[11px] font-semibold">Received</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Person Name *</Label>
                <Input
                  placeholder="e.g. Ramesh Kumar"
                  value={form.personName}
                  onChange={e => setForm(f => ({ ...f, personName: e.target.value }))}
                  className={cn("h-10 rounded-xl text-sm", errors.personName && "border-red-500")}
                />
                {errors.personName && <p className="text-[10px] text-red-500">{errors.personName}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Relationship</Label>
                <Select value={form.relationship} onValueChange={v => setForm(f => ({ ...f, relationship: v }))}>
                  <SelectTrigger className="h-10 rounded-xl text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Function Type *</Label>
                <Select value={form.functionType} onValueChange={v => setForm(f => ({ ...f, functionType: v }))}>
                  <SelectTrigger className={cn("h-10 rounded-xl text-sm", errors.functionType && "border-red-500")}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUNCTION_TYPES.map(ft => (
                      <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.functionType && <p className="text-[10px] text-red-500">{errors.functionType}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Event Name</Label>
                <Input
                  placeholder="e.g. Ramesh's Wedding"
                  value={form.functionName}
                  onChange={e => setForm(f => ({ ...f, functionName: e.target.value }))}
                  className="h-10 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Date *</Label>
                <DatePicker
                  date={form.functionDate}
                  onDateChange={d => setForm(f => ({ ...f, functionDate: d }))}
                  placeholder="Select date"
                  className={cn(errors.functionDate && "border-red-500")}
                />
                {errors.functionDate && <p className="text-[10px] text-red-500">{errors.functionDate}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Amount (₹) *</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className={cn("h-10 rounded-xl text-sm", errors.amount && "border-red-500")}
                  min={0}
                  step={100}
                />
                {errors.amount && <p className="text-[10px] text-red-500">{errors.amount}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Notes (Optional)</Label>
              <Textarea
                placeholder="Any notes..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="rounded-xl text-sm"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "flex-1 h-11 rounded-xl",
                  form.type === 'given' ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
                )}
              >
                {isSubmitting ? "Saving..." : editingTx ? 'Update' : `Save ${form.type === 'given' ? 'Given' : 'Received'}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                className="rounded-xl h-11"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-2 h-10 rounded-xl bg-gray-100 dark:bg-gray-800/50">
          <TabsTrigger value="transactions" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800">
            Transactions ({moiTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="people" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800">
            <Users size={13} className="mr-1.5" />
            People ({personSummary.length})
          </TabsTrigger>
        </TabsList>

        {/* Transactions */}
        <TabsContent value="transactions" className="space-y-3 mt-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search person or event..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-10 rounded-xl text-sm"
              />
            </div>
            <Select value={filterType} onValueChange={v => setFilterType(v as 'all' | 'given' | 'received')}>
              <SelectTrigger className="w-full sm:w-32 h-10 rounded-xl text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="given">Given</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterFunction} onValueChange={setFilterFunction}>
              <SelectTrigger className="w-full sm:w-40 h-10 rounded-xl text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Functions</SelectItem>
                {FUNCTION_TYPES.map(ft => (
                  <SelectItem key={ft.value} value={ft.value}>{ft.value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {moiLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
              <p className="text-sm text-muted-foreground">No transactions found.</p>
              {moiTransactions.length === 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-3 text-sm text-blue-600 font-medium hover:underline"
                >
                  Add first transaction
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(tx => (
                <TransactionCard
                  key={tx.id}
                  tx={tx}
                  onEdit={() => openEditForm(tx)}
                  onDelete={() => setDeleteId(tx.id)}
                  onViewHistory={() => setHistoryTx(tx)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* People */}
        <TabsContent value="people" className="mt-3">
          {personSummary.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
              <p className="text-sm text-muted-foreground">No people tracked yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {personSummary.map(p => (
                <div key={p.name} className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      {p.relationship && <p className="text-[11px] text-muted-foreground">{p.relationship}</p>}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-semibold rounded-md",
                        p.net > 0
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300"
                          : p.net < 0
                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                      )}
                    >
                      {p.net > 0 ? "+" : ""}{formatCurrency(p.net)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                      <ArrowUpCircle size={12} />
                      <span>Given: <span className="font-semibold">{formatCurrency(p.given)}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <ArrowDownCircle size={12} />
                      <span>Received: <span className="font-semibold">{formatCurrency(p.received)}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700 rounded-xl">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit History Dialog */}
      <Dialog open={!!historyTx} onOpenChange={() => setHistoryTx(null)}>
        <DialogContent className="rounded-2xl max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <History size={16} />
              Edit History — {historyTx?.personName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 py-2">
            {(!historyTx?.editHistory || historyTx.editHistory.length === 0) ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <Clock size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-muted-foreground">No edits yet</p>
                <p className="text-[11px] text-muted-foreground mt-1">Edit history will appear here once changes are made.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...historyTx.editHistory].reverse().map((record, idx) => (
                  <EditHistoryCard key={idx} record={record} index={historyTx!.editHistory!.length - idx} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EditHistoryCard = ({ record, index }: { record: MOIEditRecord; index: number }) => {
  const changeEntries = Object.entries(record.changes);
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Edit #{index}</span>
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(record.editedAt), "dd MMM yyyy, hh:mm a")}
        </span>
      </div>
      <div className="space-y-1.5">
        {changeEntries.map(([field, { from, to }]) => (
          <div key={field} className="text-[11px]">
            <span className="font-medium text-gray-600 dark:text-gray-300">{FIELD_LABELS[field] ?? field}:</span>
            <div className="flex items-center gap-1.5 mt-0.5 ml-2">
              <span className="line-through text-red-500/70 truncate max-w-[120px]">
                {field === 'amount' ? formatCurrency(Number(from)) : field === 'functionDate' ? format(new Date(from), 'dd MMM yyyy') : String(from || '—')}
              </span>
              <span className="text-gray-400">→</span>
              <span className="text-green-600 dark:text-green-400 font-medium truncate max-w-[120px]">
                {field === 'amount' ? formatCurrency(Number(to)) : field === 'functionDate' ? format(new Date(to), 'dd MMM yyyy') : String(to || '—')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TransactionCard = ({ tx, onEdit, onDelete, onViewHistory }: {
  tx: MOITransaction;
  onEdit: () => void;
  onDelete: () => void;
  onViewHistory: () => void;
}) => {
  const isGiven = tx.type === 'given';
  const hasHistory = tx.editHistory && tx.editHistory.length > 0;

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800/80 rounded-2xl border overflow-hidden",
      isGiven
        ? "border-red-100 dark:border-red-900/30"
        : "border-green-100 dark:border-green-900/30"
    )}>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div className={cn(
              "mt-0.5 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center",
              isGiven ? "bg-red-50 dark:bg-red-900/30" : "bg-green-50 dark:bg-green-900/30"
            )}>
              {isGiven
                ? <ArrowUpCircle size={15} className="text-red-500" />
                : <ArrowDownCircle size={15} className="text-green-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className="font-semibold text-sm">{tx.personName}</span>
                {tx.relationship && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-md font-normal">{tx.relationship}</Badge>
                )}
                <span className={cn(
                  "text-[10px] font-medium px-1.5 py-0 rounded-md",
                  isGiven
                    ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300"
                    : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300"
                )}>
                  {isGiven ? "Given" : "Received"}
                </span>
                {hasHistory && (
                  <span className="text-[9px] px-1 py-0 rounded bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300 font-medium">
                    edited
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {functionTypeLabel(tx.functionType)}
                {tx.functionName ? ` · ${tx.functionName}` : ''}
              </p>
              <p className="text-[11px] text-muted-foreground">{format(new Date(tx.functionDate), "dd MMM yyyy")}</p>
              {tx.notes && <p className="text-[11px] text-muted-foreground mt-0.5 italic line-clamp-1">{tx.notes}</p>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={cn(
              "font-bold text-sm tabular-nums",
              isGiven ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
            )}>
              {isGiven ? "-" : "+"}{formatCurrency(tx.amount)}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                onClick={onViewHistory}
                title="View edit history"
              >
                <History size={13} />
              </button>
              <button
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                onClick={onEdit}
                title="Edit"
              >
                <Pencil size={13} />
              </button>
              <button
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                onClick={onDelete}
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MOIDashboard;
