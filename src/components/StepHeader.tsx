interface StepHeaderPropsInterface {
  step: number;
  title: string;
}

export default function StepHeader({ step, title }: StepHeaderPropsInterface) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold uppercase tracking-wide text-orange-47">
        Paso {step}
      </span>
      <h3 className="text-lg font-bold text-orange-18">{title}</h3>
    </div>
  );
}
