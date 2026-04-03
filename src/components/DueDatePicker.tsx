import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface DueDatePickerProps {
  initialDate?: string;
  onSave: (date: string) => void;
  onRemove?: () => void;
  onClose: () => void;
}

const DueDatePicker: React.FC<DueDatePickerProps> = ({
  initialDate,
  onSave,
  onRemove,
  onClose,
}) => {
  const [tempDate, setTempDate] = useState<Date | undefined>(undefined);
  const [tempTime, setTempTime] = useState("12:00");

  useEffect(() => {
    if (initialDate) {
      const dateObj = new Date(initialDate);
      setTempDate(dateObj);
      setTempTime(format(dateObj, "HH:mm"));
    } else {
      setTempDate(new Date());
      setTempTime("12:00");
    }
  }, [initialDate]);

  const handleSave = () => {
    if (tempDate) {
      const [hours, minutes] = tempTime.split(":").map(Number);
      const finalDate = new Date(tempDate);
      finalDate.setHours(hours, minutes, 0, 0);
      onSave(finalDate.toISOString());
    }
  };

  return (
    <div className="p-3 space-y-4 max-h-[85vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white text-center flex-1">
          Dates
        </h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-[#9fadbc] hover:text-white"
          onClick={onClose}
        >
          <X size={14} />
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <Label className="text-[10px] font-bold text-[#9fadbc]">
            Date
          </Label>
          <Input
            type="text"
            readOnly
            value={tempDate ? format(tempDate, "M/d/yyyy") : ""}
            className="h-9 bg-[#22272b] border-white/10 text-white text-xs"
          />
        </div>
        <div className="w-24 space-y-1.5">
          <Label className="text-[10px] font-bold text-[#9fadbc]">
            Time
          </Label>
          <Input
            type="time"
            value={tempTime}
            onChange={(e) => setTempTime(e.target.value)}
            className="h-9 bg-[#22272b] border-white/10 text-white text-xs"
          />
        </div>
      </div>

      <div className="flex items-center justify-center">
        <Calendar
          mode="single"
          selected={tempDate}
          onSelect={setTempDate}
          autoFocus
          captionLayout="dropdown"
          className="bg-transparent text-white rounded-md p-0"
        />
      </div>

      <div className="space-y-2 pb-1">
        <Button
          className="w-full bg-primary hover:bg-primary/60 text-white font-bold h-9"
          onClick={handleSave}
        >
          Save
        </Button>
        {initialDate && onRemove && (
          <Button
            variant="outline"
            className="w-full bg-white/5 border-none hover:bg-white/10 text-[#b6c2cf] h-9"
            onClick={onRemove}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};

export default DueDatePicker;