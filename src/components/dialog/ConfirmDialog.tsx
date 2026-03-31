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
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import type React from "react";

type Props = {
  isOpen: boolean;
  onClose: (isOpen: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  intent?: "danger" | "warning" | "info";
  confirmAction: () => void;
};

const ConfirmDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  intent = "info",
  confirmAction,
}) => {
  const intentConfig = {
    danger: {
      icon: (
        <AlertTriangle size={24} className="text-destructive" strokeWidth={2} />
      ),
      buttonClass: "!bg-destructive hover:!bg-destructive/90 !text-white",
    },
    warning: {
      icon: (
        <AlertCircle size={24} className="text-amber-500" strokeWidth={2} />
      ),
      buttonClass: "!bg-amber-500 hover:!bg-amber-600 !text-white",
    },
    info: {
      icon: <Info size={24} className="text-primary" strokeWidth={2} />,
      buttonClass: "!bg-primary hover:!bg-primary/90 !text-white",
    },
  };

  const config = intentConfig[intent];

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-background border-border shadow-2xl rounded-2xl p-6 sm:max-w-md">
        <div className="flex gap-4 items-start">
          <div className="mt-0.5">{config.icon}</div>
          <AlertDialogHeader className="text-left p-0 space-y-2">
            <AlertDialogTitle className="text-lg font-semibold text-foreground tracking-tight">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="flex gap-2 mt-6 sm:justify-end">
          <AlertDialogCancel className="mt-0 bg-transparent hover:bg-muted text-foreground font-medium transition-colors">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmAction}
            className={`border-none font-medium shadow-sm transition-all ${config.buttonClass}`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
