import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import AssistantBase from './AssistantBase';

interface TargetItem {
  label: string;
  value: string;
  type: string; // 'block' | 'question'
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  availableKeys: TargetItem[];
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
    return availableKeys
      .filter((k) => k.label.toLowerCase().includes(q) || k.value.toLowerCase().includes(q));
  }, [availableKeys, search]);

  const handleInsert = () => {
    if (!selectedKey) return;
    const payload = {
      questionId: selectedKey, // sempre key
      operator,
      value,
    };
    const json = JSON.stringify(payload, null, 2);
    onInsertAction(json);
    onOpenChange(false);
  };

  return (
    <AssistantBase
      open={open}
      onOpenChange={onOpenChange}
      title={t('rule.assistantTitle', 'Assistente de Regra')}
      description={t('rule.assistantDesc', 'Crie uma condição em passos simples')}
      onCancel={() => onOpenChange(false)}
      onConfirm={handleInsert}
      confirmText={t('action.insert', 'Inserir')}
      confirmDisabled={!selectedKey || step !== 3}
      type="sheet"
    >
      {step === 1 && (
        <div className="space-y-2">
          <Label>{t('rule.chooseKey', 'Escolha a variável')}</Label>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('rule.searchPlaceholder', 'Pesquisar...')} />
          <div className="max-h-40 overflow-auto mt-2 border rounded p-2">
            {filtered.map((item) => (
              <div
                key={item.value}
                className={`p-2 rounded cursor-pointer ${selectedKey === item.value ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/10'} border-b last:border-0`}
                onClick={() => setSelectedKey(item.value)}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-[10px] uppercase bg-secondary px-1 rounded text-secondary-foreground">{item.type === 'block' ? 'Bloco' : 'Pergunta'}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 font-mono truncate" title={item.value}>
                  {item.value}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-xs text-muted-foreground">{t('rule.noResults', 'Nenhum resultado')}</div>}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          <Label>{t('rule.chooseOperator', 'Escolha o operador')}</Label>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="w-full rounded border px-2 py-1 bg-card text-card-foreground border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
          >
            <option value="=">{t('operator.equals', 'Igual a')}</option>
            <option value="!=">{t('operator.notEquals', 'Diferente de')}</option>
            <option value="contains">{t('operator.contains', 'Contém')}</option>
            <option value=">">{t('operator.gt', 'Maior que')}</option>
            <option value="<">{t('operator.lt', 'Menor que')}</option>
            <option value=">=">{t('operator.gte', 'Maior ou igual a')}</option>
            <option value="<=">{t('operator.lte', 'Menor ou igual a')}</option>
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

      <div className="flex items-center gap-2 w-full mt-4">
        <div className="flex-1">
          {/* Botões de navegação de passo */}
        </div>
        <div className="flex gap-2">
          {step > 1 && <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>{t('action.back', 'Voltar')}</Button>}
          {step < 3 && <Button onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !selectedKey}>{t('action.next', 'Próximo')}</Button>}
        </div>
      </div>
    </AssistantBase>
  );
}
