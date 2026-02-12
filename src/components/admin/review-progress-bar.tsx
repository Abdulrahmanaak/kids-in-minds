type Props = {
  reviewed: number;
  total: number;
};

export function ReviewProgressBar({ reviewed, total }: Props) {
  const percentage = total > 0 ? (reviewed / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">تقدم المراجعة</span>
        <span className="font-medium">
          {reviewed.toLocaleString("ar-SA")} / {total.toLocaleString("ar-SA")}{" "}
          <span className="text-muted-foreground">
            ({percentage.toFixed(1)}%)
          </span>
        </span>
      </div>
      <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
