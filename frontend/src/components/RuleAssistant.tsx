import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  availableKeys: string[];
  onInsertAction: (json: string) => void;
}

export default function RuleAssistant({ open, onOpenChange, availableKeys, onInsertAction }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);
  const [operator, setOperator] = React.useState('equals');
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      // reset when closed
      setStep(1);
      setSearch('');
      setSelectedKey(null);
      setOperator('equals');
      setValue('');
    }
  }, [open]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return availableKeys;
    return availableKeys.filter((k) => k.toLowerCase().includes(q));
  }, [availableKeys, search]);

  const handleInsert = () => {
    if (!selectedKey) return;
    const payload = {
      questionId: selectedKey,
      operator,
      value,
    };
    const json = JSON.stringify(payload, null, 2);
    onInsertAction(json);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{t('rule.assistantTitle', 'Assistente de Regra')}</SheetTitle>
          <SheetDescription>{t('rule.assistantDesc', 'Crie uma condição em passos simples')}</SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          {step === 1 && (
            <div className="space-y-2">
              <Label>{t('rule.chooseKey', 'Escolha a variável')}</Label>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('rule.searchPlaceholder', 'Pesquisar...')} />
              <div className="max-h-40 overflow-auto mt-2 border rounded p-2">
                {filtered.map((k) => (
                  <div key={k} className={`p-2 rounded cursor-pointer ${selectedKey === k ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/10'}`} onClick={() => setSelectedKey(k)}>
                    <div className="font-medium">{k}</div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">{"{\"questionId\":\"" + k + "\"}"}</div>
                  </div>
                ))}
                {filtered.length === 0 && <div className="text-xs text-muted-foreground">{t('rule.noResults', 'Nenhum resultado')}</div>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label>{t('rule.chooseOperator', 'Escolha o operador')}</Label>
              <select value={operator} onChange={(e) => setOperator(e.target.value)} className="w-full rounded border px-2 py-1">
                <option value="equals">{t('operator.equals', 'Igual a')}</option>
                <option value="not_equals">{t('operator.notEquals', 'Diferente de')}</option>
                <option value="contains">{t('operator.contains', 'Contém')}</option>
                <option value="gt">{t('operator.gt', 'Maior que')}</option>
                <option value="lt">{t('operator.lt', 'Menor que')}</option>
              </select>
              <Label>{t('rule.enterValue', 'Valor')}</Label>
              <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={t('rule.valuePlaceholder', 'Digite um valor')} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label>{t('rule.preview', 'Pré-visualização')}</Label>
              <div className="bg-muted/10 p-2 rounded font-mono text-sm">
                {JSON.stringify({ questionId: selectedKey, operator, value }, null, 2)}
              </div>
              <Label className="mt-2">{t('rule.summary', 'Resumo')}</Label>
              <div className="text-sm text-muted-foreground">
                {selectedKey} {operator} "{value}"
              </div>
            </div>
          )}
        </div>

        <SheetFooter>
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>{t('action.cancel', 'Cancelar')}</Button>
            </div>
            <div className="flex gap-2">
              {step > 1 && <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>{t('action.back', 'Voltar')}</Button>}
              {step < 3 && <Button onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !selectedKey}>{t('action.next', 'Próximo')}</Button>}
              {step === 3 && <Button onClick={handleInsert} disabled={!selectedKey}>{t('action.insert', 'Inserir')}</Button>}
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
