import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from './ui';


interface AssistantBaseProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmDisabled?: boolean;
  type?: 'sheet' | 'dialog'; // 'sheet' for RuleAssistant, 'dialog' for ActionAssistant
}

export default function AssistantBase({
  open,
  onOpenChange,
  title,
  description,
  children,
  onCancel,
  onConfirm,
  confirmText,
  cancelText,
  confirmDisabled = false,
  type = 'sheet',
}: AssistantBaseProps) {
  const { t } = useTranslation();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const renderContent = () => (
    <>
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
        {description && <SheetDescription>{description}</SheetDescription>}
      </SheetHeader>
      <div className="mt-4 flex-1 overflow-auto">
        {children}
      </div>
      <SheetFooter>
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1">
            <Button variant="ghost" onClick={handleCancel}>
              {cancelText || t('action.cancel', 'Cancelar')}
            </Button>
          </div>
          {onConfirm && (
            <Button onClick={handleConfirm} disabled={confirmDisabled}>
              {confirmText || t('action.confirm', 'Confirmar')}
            </Button>
          )}
        </div>
      </SheetFooter>
    </>
  );

  if (type === 'dialog') {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex flex-col sm:max-w-[425px]">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div className="mt-4 flex-1 overflow-auto">
            {children}
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={handleCancel}>
              {cancelText || t('action.cancel', 'Cancelar')}
            </Button>
            {onConfirm && (
              <Button onClick={handleConfirm} disabled={confirmDisabled}>
                {confirmText || t('action.confirm', 'Confirmar')}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        {renderContent()}
      </SheetContent>
    </Sheet>
  );
}